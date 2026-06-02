use axum::Json;

use crate::{
    domain::{HomeSummary, PageSummary},
    repositories::pages::BootstrapPageRepository,
    services::pages::PageService,
};

pub async fn pages() -> Json<Vec<PageSummary>> {
    let service = PageService::new(BootstrapPageRepository);
    Json(service.list_pages())
}

pub async fn home_summary() -> Json<HomeSummary> {
    let service = PageService::new(BootstrapPageRepository);
    Json(service.home_summary())
}
