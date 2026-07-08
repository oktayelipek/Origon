import SwiftUI

/// SwiftUI EnvironmentValue for the active [OrigonThemeData].
/// Read anywhere in the view tree:
///
///     @Environment(\.origonTheme) var theme
///
/// Wire it up at the root:
///
///     MyRootView()
///         .origonTheme(OrigonThemes.kriptoDark)

private struct OrigonThemeKey: EnvironmentKey {
    static let defaultValue: OrigonThemeData = OrigonThemes.kriptoDark
}

public extension EnvironmentValues {
    var origonTheme: OrigonThemeData {
        get { self[OrigonThemeKey.self] }
        set { self[OrigonThemeKey.self] = newValue }
    }
}

public extension View {
    /// Applies an Origon UI theme to this subtree.
    func origonTheme(_ theme: OrigonThemeData) -> some View {
        environment(\.origonTheme, theme)
    }
}
