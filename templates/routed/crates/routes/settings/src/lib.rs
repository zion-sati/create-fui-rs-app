mod generated;

use __CRATE_NAME___shared::{create_nav_bar, primary_button};
use fui::prelude::*;
use std::cell::Cell;
use std::rc::Rc;

#[derive(Clone)]
struct SettingsPage {
    root: SelectionArea,
}

fui_component!(SettingsPage => root);

impl SettingsPage {
    fn new() -> Self {
        Application::caption("__PROJECT_NAME__ • Settings");
        use_system_theme();
        let nav_bar = create_nav_bar(false);
        let status = text("Settings saved: 0").font_size(18.0).clone();
        let count = Rc::new(Cell::new(0_i32));
        let action = primary_button("Save settings");
        action.on_click({
            let count = count.clone();
            let status = status.clone();
            move |_event| {
                let next = count.get() + 1;
                count.set(next);
                status.text(format!("Settings saved: {}", next));
            }
        });
        let content = ui! {
            column().fill_size().padding(24.0, 24.0, 24.0, 24.0) {
                nav_bar,
                flex_box().height(24.0, Unit::Pixel),
                text("Settings page").font_size(34.0),
                flex_box().height(12.0, Unit::Pixel),
                text("This page is a separate MVC slice with its own model and controller.").font_size(16.0),
                flex_box().height(20.0, Unit::Pixel),
                status,
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

fui_app!(SettingsPage, SettingsPage::new);
