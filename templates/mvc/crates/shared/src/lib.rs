use fui::prelude::*;

#[derive(Clone)]
pub struct StarterNavBar {
    root: FlexBox,
}

fui_component!(StarterNavBar => root);

pub fn create_nav_bar(home_is_active: bool) -> StarterNavBar {
    let home_link = nav_link("/");
    home_link
        .text("Home")
        .corner_radius(999.0)
        .padding(16.0, 8.0, 16.0, 8.0);
    let settings_link = nav_link("/settings/");
    settings_link
        .text("Settings")
        .corner_radius(999.0)
        .padding(16.0, 8.0, 16.0, 8.0);

    let root = ui! {
        row()
            .width(100.0, Unit::Percent)
            .justify_content(JustifyContent::End)
            .align_items(AlignItems::Center) {
                home_link,
                flex_box().width(10.0, Unit::Pixel).height(1.0, Unit::Pixel),
                settings_link,
        }
    };
    root.bind_theme({
        let home_link = home_link.clone();
        let settings_link = settings_link.clone();
        move |_root, theme| {
            home_link
                .bg_color(theme.colors.surface)
                .border(if home_is_active { 1.5 } else { 0.0 }, theme.colors.accent);
            settings_link
                .bg_color(theme.colors.surface)
                .border(if home_is_active { 0.0 } else { 1.5 }, theme.colors.accent);
        }
    });
    StarterNavBar { root }
}

pub fn primary_button(label: impl Into<String>) -> Button {
    let button = button(label);
    button.corner_radius(12.0).padding(18.0, 10.0, 18.0, 10.0);
    button
}
