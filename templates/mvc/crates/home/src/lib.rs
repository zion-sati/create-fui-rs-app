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
        let count = Rc::new(Cell::new(0_i32));
        let action = primary_button("Increment home counter");
        action.on_click({
            let count = count.clone();
            let status = status.clone();
            move |_event| {
                let next = count.get() + 1;
                count.set(next);
                status.text(format!("Home counter: {}", next));
            }
        });
        let content = ui! {
            column().fill_size().padding(24.0, 24.0, 24.0, 24.0) {
                nav_bar,
                flex_box().height(24.0, Unit::Pixel),
                text("Home page").font_size(34.0),
                flex_box().height(12.0, Unit::Pixel),
                text("Page-level retained Rust sample. Use the header pills to navigate.").font_size(16.0),
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

fui_managed_app!(HomePage, HomePage::new, |page: &HomePage| page.clone());
