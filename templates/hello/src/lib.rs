use fui::prelude::*;

fn build_page() -> FlexBox {
    ui! {
        column()
            .fill_size()
            .padding(24.0, 24.0, 24.0, 24.0)
            .bg_color(0x0F172AFF) {
                text("Hello from FUI-RS")
                    .font_size(28.0)
                    .text_color(0xF8FAFCFF),
                text("This app uses fui_app!, so lifecycle exports are SDK glue instead of user code.")
                    .font_size(16.0)
                    .text_color(0xCBD5E1FF)
                    .text_limits(-1, 3),
        }
    }
}

fui_app!(FlexBox, build_page);
