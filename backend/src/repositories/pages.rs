use crate::domain::{HomeSummary, PageSummary};

#[derive(Clone, Copy)]
pub struct BootstrapPageRepository;

impl BootstrapPageRepository {
    pub fn list_pages(&self) -> Vec<PageSummary> {
        vec![
            PageSummary {
                id: "home",
                title: "首頁",
                primary_action: "快速開始",
                route: "/",
            },
            PageSummary {
                id: "course-explore",
                title: "課程探索",
                primary_action: "查看詳情",
                route: "/courses",
            },
            PageSummary {
                id: "learning-player",
                title: "學習播放",
                primary_action: "我學會了",
                route: "/learn",
            },
            PageSummary {
                id: "practice-game",
                title: "練習遊戲",
                primary_action: "下一題",
                route: "/practice",
            },
            PageSummary {
                id: "rewards",
                title: "獎勵成就",
                primary_action: "查看徽章",
                route: "/rewards",
            },
        ]
    }

    pub fn home_summary(&self) -> HomeSummary {
        HomeSummary {
            current_child: "小安",
            recommendation: "動物英文單字",
            next_action: "繼續未完成學習",
            completed_units: 8,
            streak_days: 3,
            stars: 120,
        }
    }
}
