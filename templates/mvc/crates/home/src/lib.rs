mod generated;

use __CRATE_NAME___shared::generated::host_services::app_clock_now_unix_seconds;
use __CRATE_NAME___shared::{create_nav_bar, primary_button};
use fui::prelude::*;
use std::cell::Cell;
use std::rc::Rc;

#[derive(Clone)]
struct HomePage {
    root: SelectionArea,
}

fui_component!(HomePage => root);

impl HomePage {
    fn new() -> Self {
        use_system_theme();
        let nav_bar = create_nav_bar(true);
        let status = text("Home counter: 0").font_size(18.0).clone();
        let host_service = text(format!(
            "Host service time: {}",
            app_clock_now_unix_seconds()
        ))
        .font_size(15.0)
        .clone();
        let host_event = text("Host event tick: -").font_size(15.0).clone();
        generated::host_events::on_app_clock_tick({
            let host_event = host_event.clone();
            move |value| {
                host_event.text(format!("Host event tick: {}", value));
            }
        });
        let count = Rc::new(Cell::new(0_i32));
        let action = primary_button("Increment home counter");
        action.on_click({
            let count = count.clone();
            let status = status.clone();
            let host_service = host_service.clone();
            move |_event| {
                let next = count.get() + 1;
                count.set(next);
                status.text(format!("Home counter: {}", next));
                host_service.text(format!(
                    "Host service time: {}",
                    app_clock_now_unix_seconds()
                ));
            }
        });
        let content = ui! {
            column().fill_size().padding(24.0, 24.0, 24.0, 24.0) {
                nav_bar,
                flex_box().height(24.0, Unit::Pixel),
                text("Home page").font_size(34.0),
                flex_box().height(12.0, Unit::Pixel),
                text("Page-level MVC sample. Use the header pills to navigate.").font_size(16.0),
                flex_box().height(20.0, Unit::Pixel),
                status,
                flex_box().height(10.0, Unit::Pixel),
                host_service,
                host_event,
                flex_box().height(16.0, Unit::Pixel),
                action,
            }
        };
        let root = selection_area();
        root.fill_size().child(&content).bind_theme(|root, theme| {
            root.bg_color(theme.colors.background);
        });
        Self { root }
    }
}

fn dispose_home_page(_: &HomePage) {
    generated::host_events::clear_app_clock_tick();
}

fui_managed_app!(
    HomePage,
    HomePage::new,
    |page: &HomePage| page.clone(),
    dispose: dispose_home_page
);
