use fui_rs::prelude::*;

struct HomePage {
    root: FlexBox,
}

impl HomePage {
    fn new() -> Self {
        let root = ui! {
            column()
                .fill_size()
                .padding(24.0, 24.0, 24.0, 24.0)
                .bg_color(0xF8FAFCFF) {
                    text("Home")
                        .font_size(28.0)
                        .text_color(0x0F172AFF),
                    nav_link("/settings/")
                        .text("Open settings"),
            }
        };
        Self { root }
    }

    fn root(&self) -> FlexBox {
        self.root.clone()
    }
}

fui_managed_app!(HomePage, HomePage::new, |page: &HomePage| page.root());
