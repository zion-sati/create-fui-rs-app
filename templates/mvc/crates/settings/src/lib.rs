use fui_rs::prelude::*;

struct SettingsPage {
    root: FlexBox,
}

impl SettingsPage {
    fn new() -> Self {
        let root = ui! {
            column()
                .fill_size()
                .padding(24.0, 24.0, 24.0, 24.0)
                .bg_color(0xEFF6FFFF) {
                    text("Settings")
                        .font_size(28.0)
                        .text_color(0x0F172AFF),
                    nav_link("/")
                        .text("Back home"),
            }
        };
        Self { root }
    }

    fn root(&self) -> FlexBox {
        self.root.clone()
    }
}

fui_managed_app!(SettingsPage, SettingsPage::new, |page: &SettingsPage| page.root());
