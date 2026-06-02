use tokio_postgres::{Client, NoTls};

use crate::domain::{ActivitySummary, CourseDetail, CourseSummary, LessonSummary};

#[derive(Clone, Copy, Debug, Default)]
pub struct CourseSelection<'a> {
    pub market_region: Option<&'a str>,
    pub english_variant: Option<&'a str>,
}

pub struct CourseRepository {
    database_url: String,
}

impl CourseRepository {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    async fn connect(&self) -> Result<Client, tokio_postgres::Error> {
        let (client, connection) = tokio_postgres::connect(&self.database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                tracing::error!(%error, "postgres course connection error");
            }
        });
        Ok(client)
    }

    pub async fn list_courses(
        &self,
        selection: CourseSelection<'_>,
    ) -> Result<Vec<CourseSummary>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT courses.id::text,
                    courses.slug,
                    courses.status,
                    courses.title,
                    courses.target_language,
                    courses.level,
                    courses.market_regions,
                    courses.english_variants,
                    assets.path AS cover_asset_path,
                    count(lessons.id)::bigint AS lesson_count
                FROM courses
                LEFT JOIN assets ON courses.cover_asset_id = assets.id
                LEFT JOIN lessons ON lessons.course_id = courses.id
                    AND ($1::text IS NULL OR $1 = ANY(lessons.market_regions))
                    AND ($2::text IS NULL OR $2 = ANY(lessons.english_variants))
                WHERE ($1::text IS NULL OR $1 = ANY(courses.market_regions))
                    AND ($2::text IS NULL OR $2 = ANY(courses.english_variants))
                GROUP BY courses.id, assets.path
                ORDER BY courses.sort_order ASC, courses.title ASC
                "#,
                &[&selection.market_region, &selection.english_variant],
            )
            .await?;

        Ok(rows.iter().map(course_summary_from_row).collect())
    }

    pub async fn get_course(
        &self,
        course_slug: &str,
        selection: CourseSelection<'_>,
    ) -> Result<Option<CourseDetail>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let row = client
            .query_opt(
                r#"
                SELECT courses.id::text,
                    courses.slug,
                    courses.status,
                    courses.title,
                    courses.target_language,
                    courses.level,
                    courses.market_regions,
                    courses.english_variants,
                    assets.path AS cover_asset_path
                FROM courses
                LEFT JOIN assets ON courses.cover_asset_id = assets.id
                WHERE courses.slug = $1
                    AND ($2::text IS NULL OR $2 = ANY(courses.market_regions))
                    AND ($3::text IS NULL OR $3 = ANY(courses.english_variants))
                "#,
                &[
                    &course_slug,
                    &selection.market_region,
                    &selection.english_variant,
                ],
            )
            .await?;

        Ok(row.map(|row| course_detail_from_row(&row)))
    }

    pub async fn list_lessons(
        &self,
        course_slug: &str,
        selection: CourseSelection<'_>,
    ) -> Result<Vec<LessonSummary>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT lessons.id::text,
                    lessons.course_id::text,
                    lessons.slug,
                    lessons.title,
                    lessons.learning_objectives,
                    lessons.sort_order
                FROM lessons
                INNER JOIN courses ON courses.id = lessons.course_id
                WHERE courses.slug = $1
                    AND ($2::text IS NULL OR $2 = ANY(courses.market_regions))
                    AND ($3::text IS NULL OR $3 = ANY(courses.english_variants))
                    AND ($2::text IS NULL OR $2 = ANY(lessons.market_regions))
                    AND ($3::text IS NULL OR $3 = ANY(lessons.english_variants))
                ORDER BY lessons.sort_order ASC, lessons.title ASC
                "#,
                &[
                    &course_slug,
                    &selection.market_region,
                    &selection.english_variant,
                ],
            )
            .await?;

        Ok(rows.iter().map(lesson_from_row).collect())
    }

    pub async fn list_activities(
        &self,
        lesson_id: &str,
        selection: CourseSelection<'_>,
    ) -> Result<Vec<ActivitySummary>, tokio_postgres::Error> {
        let client = self.connect().await?;
        let rows = client
            .query(
                r#"
                SELECT activities.id::text,
                    activities.lesson_id::text,
                    activities.slug,
                    activities.activity_type,
                    activities.prompt || COALESCE((activities.variant_overrides -> $3::text) -> 'prompt', '{}'::jsonb) AS prompt,
                    activities.content || COALESCE((activities.variant_overrides -> $3::text) -> 'content', '{}'::jsonb) AS content,
                    activities.answer_key || COALESCE((activities.variant_overrides -> $3::text) -> 'answer_key', '{}'::jsonb) AS answer_key,
                    activities.sort_order
                FROM activities
                INNER JOIN lessons ON lessons.id = activities.lesson_id
                INNER JOIN courses ON courses.id = lessons.course_id
                WHERE activities.lesson_id = $1::text::uuid
                    AND ($2::text IS NULL OR $2 = ANY(courses.market_regions))
                    AND ($3::text IS NULL OR $3 = ANY(courses.english_variants))
                    AND ($2::text IS NULL OR $2 = ANY(lessons.market_regions))
                    AND ($3::text IS NULL OR $3 = ANY(lessons.english_variants))
                    AND ($2::text IS NULL OR $2 = ANY(activities.market_regions))
                    AND ($3::text IS NULL OR $3 = ANY(activities.english_variants))
                ORDER BY activities.sort_order ASC, activities.slug ASC
                "#,
                &[
                    &lesson_id,
                    &selection.market_region,
                    &selection.english_variant,
                ],
            )
            .await?;

        Ok(rows.iter().map(activity_from_row).collect())
    }
}

fn course_summary_from_row(row: &tokio_postgres::Row) -> CourseSummary {
    CourseSummary {
        id: row.get("id"),
        slug: row.get("slug"),
        status: row.get("status"),
        title: row.get("title"),
        target_language: row.get("target_language"),
        level: row.get("level"),
        market_regions: row.get("market_regions"),
        english_variants: row.get("english_variants"),
        cover_asset_path: row.get("cover_asset_path"),
        lesson_count: row.get("lesson_count"),
    }
}

fn course_detail_from_row(row: &tokio_postgres::Row) -> CourseDetail {
    CourseDetail {
        id: row.get("id"),
        slug: row.get("slug"),
        status: row.get("status"),
        title: row.get("title"),
        target_language: row.get("target_language"),
        level: row.get("level"),
        market_regions: row.get("market_regions"),
        english_variants: row.get("english_variants"),
        cover_asset_path: row.get("cover_asset_path"),
    }
}

fn lesson_from_row(row: &tokio_postgres::Row) -> LessonSummary {
    LessonSummary {
        id: row.get("id"),
        course_id: row.get("course_id"),
        slug: row.get("slug"),
        title: row.get("title"),
        learning_objectives: row.get("learning_objectives"),
        sort_order: row.get("sort_order"),
    }
}

fn activity_from_row(row: &tokio_postgres::Row) -> ActivitySummary {
    ActivitySummary {
        id: row.get("id"),
        lesson_id: row.get("lesson_id"),
        slug: row.get("slug"),
        activity_type: row.get("activity_type"),
        prompt: row.get("prompt"),
        content: row.get("content"),
        answer_key: row.get("answer_key"),
        sort_order: row.get("sort_order"),
    }
}
