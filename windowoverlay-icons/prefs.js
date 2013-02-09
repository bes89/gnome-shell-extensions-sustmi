const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const GObject = imports.gi.GObject;

const Gettext = imports.gettext;
const _ = Gettext.gettext;

const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const PREFS_UI = Me.dir.get_path() + '/prefs.xml';
const PREFS_SCHEMA = 'org.gnome.shell.extensions.windowoverlay-icons';

const Alignment = {
    TOP_LEFT: 1,
    TOP_MIDDLE: 2,
    TOP_RIGHT: 3,
    MIDDLE_LEFT: 4,
    MIDDLE_MIDDLE: 5,
    MIDDLE_RIGHT: 6,
    BOTTOM_LEFT: 7,
    BOTTOM_MIDDLE: 8,
    BOTTOM_RIGHT: 9
};

const HorizontalAlignment = {
    LEFT: 1,
    MIDDLE: 2,
    RIGHT: 3
};

const VerticalAlignment = {
    TOP: 1,
    MIDDLE: 2,
    BOTTOM: 3
};

function init() {
    Convenience.initTranslations();
}

function getErrorLabel(message) {
    let label = new Gtk.Label();
    label.set_text(message);
    return label;
}

const WindowOverlayIcosExtensionPrefsWidget = new GObject.Class({
    Name: 'WindowOverlayIconsExtension.Prefs.Widget',
    GTypeName: 'WindowOverlayIconsExtensionPrefsWidget',
    Extends: Gtk.Box,
    
    _init: function(params) {
        this.parent(params);
        
        try {
            this._settings = Convenience.getSettings(PREFS_SCHEMA);
        } catch (e) {
            this.add(getErrorLabel('settings dnx'));
            return;
        }
        
        let builder = new Gtk.Builder();
        builder.set_translation_domain(Me.metadata['gettext-domain']);
        
        try {
            builder.add_from_file(PREFS_UI);
        } catch (e) {
            this.add(getErrorLabel('PREFS_UI dnx'));
            return;
        }
        
        this._mainGrid = builder.get_object('main_grid');
        this._icon_alignment = builder.get_object('icon_alignment');
        this._icon_size = builder.get_object('icon_size');
        this._icon_size_relative = builder.get_object('icon_size_relative');
        
        this._background_color = builder.get_object('background_color');
        
        this._fillData(builder);
        this._connectSignals(builder);
        
        this.add(this._mainGrid);
    },
    
    _fillData: function(builder) {
        let h = this._settings.get_enum('icon-horizontal-alignment');
        let v = this._settings.get_enum('icon-vertical-alignment');
        this._icon_alignment.current_value = 3 * (v - 1) + h;
        
        this._icon_size.value = this._settings.get_int('icon-size');
        this._icon_size_relative.active = this._settings.get_boolean('icon-size-relative');
        
        [result, background_color] = Gdk.color_parse(this._settings.get_string('background-color'));
        if (result) {
            this._background_color.color = background_color;
        }
        this._background_color.alpha = this._settings.get_int('background-alpha');
    },
    
    _connectSignals: function(builder) {
        this._icon_alignment.connect('changed', Lang.bind(this, function(action, current) {
            let h, v;
            switch (current.value) {
                case Alignment.TOP_LEFT:
                    h = HorizontalAlignment.LEFT;
                    v = VerticalAlignment.TOP;
                    break;
                case Alignment.TOP_MIDDLE:
                    h = HorizontalAlignment.MIDDLE;
                    v = VerticalAlignment.TOP;
                    break;
                case Alignment.TOP_RIGHT:
                    h = HorizontalAlignment.RIGHT;
                    v = VerticalAlignment.TOP;
                    break;
                case Alignment.MIDDLE_LEFT:
                    h = HorizontalAlignment.LEFT;
                    v = VerticalAlignment.MIDDLE;
                    break;
                case Alignment.MIDDLE_MIDDLE:
                    h = HorizontalAlignment.MIDDLE;
                    v = VerticalAlignment.MIDDLE;
                    break;
                case Alignment.MIDDLE_RIGHT:
                    h = HorizontalAlignment.RIGHT;
                    v = VerticalAlignment.MIDDLE;
                    break;
                case Alignment.BOTTOM_LEFT:
                    h = HorizontalAlignment.LEFT;
                    v = VerticalAlignment.BOTTOM;
                    break;
                case Alignment.BOTTOM_MIDDLE:
                    h = HorizontalAlignment.MIDDLE;
                    v = VerticalAlignment.BOTTOM;
                    break;
                case Alignment.BOTTOM_RIGHT:
                default:
                    h = HorizontalAlignment.RIGHT;
                    v = VerticalAlignment.BOTTOM;
                    break;
            }
            this._settings.set_enum('icon-horizontal-alignment', h);
            this._settings.set_enum('icon-vertical-alignment', v);
        }));
        
        this._icon_size.connect('value-changed', Lang.bind(this, function(spinbutton) {
            this._settings.set_int('icon-size', spinbutton.value);
        }));
        
        this._icon_size_relative.connect('toggled', Lang.bind(this, function(togglebutton) {
            this._settings.set_boolean('icon-size-relative', togglebutton.active);
        }));
        
        this._background_color.connect('color-set', Lang.bind(this, function(colorbutton) {
            this._settings.set_string('background-color', colorbutton.color.to_string());
            this._settings.set_int('background-alpha', colorbutton.alpha);
        }));
    }
});

function buildPrefsWidget() {
    let widget = new WindowOverlayIcosExtensionPrefsWidget();
    widget.show_all();
    return widget;
}
