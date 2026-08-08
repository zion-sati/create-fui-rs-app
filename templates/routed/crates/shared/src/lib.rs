use fui::prelude::*;

pub mod generated;

#[derive(Clone)]
pub struct StarterNavBar {
    root: FlexBox,
}

fui_component!(StarterNavBar => root);

pub fn create_nav_bar(home_is_active: bool) -> StarterNavBar {
    let home_label = text("Home");
    home_label.selectable(false);
    let home_link = nav_link("/");
    home_link
        .corner_radius(999.0)
        .padding(16.0, 8.0, 16.0, 8.0);
    home_link.child(&home_label).semantic_label("Home");

    let settings_label = text("Settings");
    settings_label.selectable(false);
    let settings_link = nav_link("/settings/");
    settings_link
        .corner_radius(999.0)
        .padding(16.0, 8.0, 16.0, 8.0);
    settings_link
        .child(&settings_label)
        .semantic_label("Settings");

    home_link.bind_interaction_state({
        let home_label = home_label.clone();
        move |state, theme| {
            home_label.text_color(if home_is_active {
                theme.colors.text_on_accent
            } else if state.hovered || state.pressed {
                theme.colors.accent_hovered
            } else {
                theme.colors.text_muted
            });
        }
    });
    settings_link.bind_interaction_state({
        let settings_label = settings_label.clone();
        move |state, theme| {
            settings_label.text_color(if !home_is_active {
                theme.colors.text_on_accent
            } else if state.hovered || state.pressed {
                theme.colors.accent_hovered
            } else {
                theme.colors.text_muted
            });
        }
    });

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
        let home_label = home_label.clone();
        let settings_label = settings_label.clone();
        move |_root, theme| {
            home_link
                .bg_color(if home_is_active {
                    theme.colors.accent
                } else {
                    theme.colors.surface
                });
            home_label.text_color(if home_is_active {
                theme.colors.text_on_accent
            } else {
                theme.colors.text_muted
            });
            settings_link
                .bg_color(if home_is_active {
                    theme.colors.surface
                } else {
                    theme.colors.accent
                });
            settings_label.text_color(if home_is_active {
                theme.colors.text_muted
            } else {
                theme.colors.text_on_accent
            });
        }
    });
    StarterNavBar { root }
}

pub fn primary_button(label: impl Into<String>) -> Button {
    let button = button(label);
    button
        .corner_radius(12.0)
        .padding(18.0, 10.0, 18.0, 10.0)
        .font_size(14.0);
    button
}
