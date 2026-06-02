use tokio_postgres::NoTls;

pub struct ContentCheckReport {
    pub total_courses: i64,
    pub published_courses: i64,
    pub failures: Vec<String>,
}

pub async fn run_content_check(
    database_url: &str,
) -> Result<ContentCheckReport, Box<dyn std::error::Error + Send + Sync>> {
    let (client, connection) = tokio_postgres::connect(database_url, NoTls).await?;
    let connection_task = tokio::spawn(async move {
        if let Err(error) = connection.await {
            tracing::error!(%error, "postgres content checker connection error");
        }
    });

    let stats = client
        .query_one(
            r#"
            SELECT count(*)::bigint AS total_courses,
                count(*) FILTER (WHERE status = 'published')::bigint AS published_courses
            FROM courses
            "#,
            &[],
        )
        .await?;

    let mut report = ContentCheckReport {
        total_courses: stats.get("total_courses"),
        published_courses: stats.get("published_courses"),
        failures: Vec::new(),
    };

    collect_course_failures(&client, &mut report).await?;
    collect_lesson_failures(&client, &mut report).await?;
    collect_activity_failures(&client, &mut report).await?;
    collect_asset_failures(&client, &mut report).await?;

    drop(client);
    let _ = connection_task.await;

    Ok(report)
}

async fn collect_course_failures(
    client: &tokio_postgres::Client,
    report: &mut ContentCheckReport,
) -> Result<(), tokio_postgres::Error> {
    let rows = client
        .query(
            r#"
            SELECT slug
            FROM courses
            WHERE status = 'published'
                AND cover_asset_id IS NULL
            ORDER BY slug
            "#,
            &[],
        )
        .await?;

    for row in rows {
        let course_slug: String = row.get("slug");
        report.failures.push(format!(
            "published course {course_slug} has no cover_asset_id"
        ));
    }

    let rows = client
        .query(
            r#"
            SELECT courses.slug AS course_slug
            FROM courses
            WHERE courses.status = 'published'
                AND NOT EXISTS (
                    SELECT 1 FROM lessons
                    WHERE lessons.course_id = courses.id
                )
            ORDER BY courses.slug
            "#,
            &[],
        )
        .await?;

    for row in rows {
        let course_slug: String = row.get("course_slug");
        report
            .failures
            .push(format!("published course {course_slug} has no lesson"));
    }

    Ok(())
}

async fn collect_lesson_failures(
    client: &tokio_postgres::Client,
    report: &mut ContentCheckReport,
) -> Result<(), tokio_postgres::Error> {
    let rows = client
        .query(
            r#"
            SELECT courses.slug AS course_slug,
                lessons.slug AS lesson_slug
            FROM lessons
            INNER JOIN courses ON courses.id = lessons.course_id
            WHERE courses.status = 'published'
                AND NOT EXISTS (
                    SELECT 1 FROM activities
                    WHERE activities.lesson_id = lessons.id
                )
            ORDER BY courses.slug, lessons.slug
            "#,
            &[],
        )
        .await?;

    for row in rows {
        let course_slug: String = row.get("course_slug");
        let lesson_slug: String = row.get("lesson_slug");
        report.failures.push(format!(
            "published lesson {course_slug}/{lesson_slug} has no activity"
        ));
    }

    Ok(())
}

async fn collect_activity_failures(
    client: &tokio_postgres::Client,
    report: &mut ContentCheckReport,
) -> Result<(), tokio_postgres::Error> {
    let rows = client
        .query(
            r#"
            SELECT courses.slug AS course_slug,
                lessons.slug AS lesson_slug,
                activities.slug AS activity_slug
            FROM activities
            INNER JOIN lessons ON lessons.id = activities.lesson_id
            INNER JOIN courses ON courses.id = lessons.course_id
            WHERE courses.status = 'published'
                AND (
                    activities.answer_key = '{}'::jsonb
                    OR (
                        NULLIF(activities.answer_key->>'correct_answer', '') IS NULL
                        AND NULLIF(activities.answer_key->>'expected', '') IS NULL
                    )
                )
            ORDER BY courses.slug, lessons.slug, activities.slug
            "#,
            &[],
        )
        .await?;

    for row in rows {
        push_activity_failure(
            report,
            &row,
            "has no answer_key.correct_answer or answer_key.expected",
        );
    }

    let rows = client
        .query(
            r#"
            SELECT courses.slug AS course_slug,
                lessons.slug AS lesson_slug,
                activities.slug AS activity_slug
            FROM activities
            INNER JOIN lessons ON lessons.id = activities.lesson_id
            INNER JOIN courses ON courses.id = lessons.course_id
            WHERE courses.status = 'published'
                AND activities.activity_type = 'word_card'
                AND (
                    NULLIF(activities.content->>'audio_asset_key', '') IS NULL
                    OR (
                        NULLIF(activities.content->>'image_asset_key', '') IS NULL
                        AND NULLIF(activities.content->>'color_hex', '') IS NULL
                        AND NOT (activities.content ? 'number')
                    )
                )
            ORDER BY courses.slug, lessons.slug, activities.slug
            "#,
            &[],
        )
        .await?;

    for row in rows {
        push_activity_failure(
            report,
            &row,
            "is a published word_card without required audio and visual/counting material",
        );
    }

    Ok(())
}

async fn collect_asset_failures(
    client: &tokio_postgres::Client,
    report: &mut ContentCheckReport,
) -> Result<(), tokio_postgres::Error> {
    let rows = client
        .query(
            r#"
            SELECT courses.slug AS course_slug,
                assets.asset_key,
                assets.status
            FROM courses
            INNER JOIN assets ON assets.id = courses.cover_asset_id
            WHERE courses.status = 'published'
                AND assets.status NOT IN ('approved', 'published')
            ORDER BY courses.slug, assets.asset_key
            "#,
            &[],
        )
        .await?;

    for row in rows {
        let course_slug: String = row.get("course_slug");
        let asset_key: String = row.get("asset_key");
        let status: String = row.get("status");
        report.failures.push(format!(
            "published course {course_slug} uses unapproved cover asset {asset_key} with status {status}"
        ));
    }

    let rows = client
        .query(
            r#"
            WITH linked_assets AS (
                SELECT courses.slug AS course_slug,
                    lessons.slug AS lesson_slug,
                    activities.slug AS activity_slug,
                    asset_refs.asset_kind,
                    asset_refs.asset_key
                FROM activities
                INNER JOIN lessons ON lessons.id = activities.lesson_id
                INNER JOIN courses ON courses.id = lessons.course_id
                CROSS JOIN LATERAL (
                    VALUES
                        ('image', NULLIF(activities.content->>'image_asset_key', '')),
                        ('audio', NULLIF(activities.content->>'audio_asset_key', ''))
                ) AS asset_refs(asset_kind, asset_key)
                WHERE courses.status = 'published'
                    AND asset_refs.asset_key IS NOT NULL
            )
            SELECT linked_assets.course_slug,
                linked_assets.lesson_slug,
                linked_assets.activity_slug,
                linked_assets.asset_kind,
                linked_assets.asset_key,
                assets.status
            FROM linked_assets
            LEFT JOIN assets ON assets.asset_key = linked_assets.asset_key
            WHERE assets.id IS NULL
                OR assets.status NOT IN ('approved', 'published')
            ORDER BY linked_assets.course_slug,
                linked_assets.lesson_slug,
                linked_assets.activity_slug,
                linked_assets.asset_kind
            "#,
            &[],
        )
        .await?;

    for row in rows {
        let course_slug: String = row.get("course_slug");
        let lesson_slug: String = row.get("lesson_slug");
        let activity_slug: String = row.get("activity_slug");
        let asset_kind: String = row.get("asset_kind");
        let asset_key: String = row.get("asset_key");
        let status: Option<String> = row.get("status");
        let status = status.unwrap_or_else(|| "missing".to_string());
        report.failures.push(format!(
            "published activity {course_slug}/{lesson_slug}/{activity_slug} uses {asset_kind} asset {asset_key} with status {status}"
        ));
    }

    Ok(())
}

fn push_activity_failure(
    report: &mut ContentCheckReport,
    row: &tokio_postgres::Row,
    message: &str,
) {
    let course_slug: String = row.get("course_slug");
    let lesson_slug: String = row.get("lesson_slug");
    let activity_slug: String = row.get("activity_slug");
    report.failures.push(format!(
        "published activity {course_slug}/{lesson_slug}/{activity_slug} {message}"
    ));
}
