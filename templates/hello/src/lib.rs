use fui::prelude::*;
use std::cell::Cell;
use std::rc::Rc;

#[derive(Clone)]
struct HelloWorld {
    root: SelectionArea,
}

fui_component!(HelloWorld => root);

impl HelloWorld {
    fn new() -> Self {
        Application::caption("__PROJECT_NAME__");
        use_system_theme();

        let counter = Rc::new(Cell::new(0_i32));
        let counter_label = text("Clicked 0 times").font_size(20.0).clone();
        let click_button = button("Click me");
        click_button.margin(0.0, 18.0, 0.0, 12.0);
        click_button.on_click({
            let counter = counter.clone();
            let counter_label = counter_label.clone();
            move |_event| {
                let count = counter.get() + 1;
                counter.set(count);
                counter_label.text(format!(
                    "Clicked {} time{}",
                    count,
                    if count == 1 { "" } else { "s" }
                ));
            }
        });

        let content = ui! {
            column()
                .fill_size()
                .padding(24.0, 24.0, 24.0, 24.0)
                .justify_content(JustifyContent::Center)
                .align_items(AlignItems::Center) {
                    text("Hello world from FUI-RS")
                        .font_size(36.0)
                        .text_align(TextAlign::Center)
                        .width(100.0, Unit::Percent),
                    text("A retained Rust app with an SDK-owned browser lifecycle")
                        .font_size(16.0)
                        .text_align(TextAlign::Center)
                        .width(100.0, Unit::Percent),
                    click_button,
                    counter_label,
                    text("Move to the routed MVC template once screens, state, or host integration grows.")
                        .font_size(14.0)
                        .text_align(TextAlign::Center)
                        .width(100.0, Unit::Percent)
                        .text_limits(-1, 3),
            }
        };
        let root = selection_area();
        root.fill_size().child(&content).bind_theme(|root, theme| {
            root.bg_color(theme.colors.background);
        });

        Self { root }
    }
}

fui_app!(HelloWorld, HelloWorld::new);
