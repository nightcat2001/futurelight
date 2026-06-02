use crate::{
    domain::{HomeSummary, PageSummary},
    repositories::pages::BootstrapPageRepository,
};

pub struct PageService {
    repository: BootstrapPageRepository,
}

impl PageService {
    pub fn new(repository: BootstrapPageRepository) -> Self {
        Self { repository }
    }

    pub fn list_pages(&self) -> Vec<PageSummary> {
        self.repository.list_pages()
    }

    pub fn home_summary(&self) -> HomeSummary {
        self.repository.home_summary()
    }
}
