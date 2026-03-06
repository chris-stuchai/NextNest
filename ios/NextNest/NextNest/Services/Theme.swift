import SwiftUI

/// Design tokens and shared styling for the NextNest iOS app.
enum Theme {
    static let accent = Color(red: 0.051, green: 0.58, blue: 0.533)
    static let accentLight = Color(red: 0.051, green: 0.58, blue: 0.533).opacity(0.12)
    static let background = Color(uiColor: .systemBackground)
    static let secondaryBackground = Color(uiColor: .secondarySystemBackground)
    static let cardBackground = Color(uiColor: .secondarySystemGroupedBackground)
    static let destructive = Color.red

    static let cornerRadius: CGFloat = 16
    static let cardCornerRadius: CGFloat = 20
    static let smallCornerRadius: CGFloat = 10

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }
}

extension View {
    /// Standard card modifier with shadow and rounded corners.
    func cardStyle() -> some View {
        self
            .padding(Theme.Spacing.md)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardCornerRadius, style: .continuous))
            .shadow(color: .black.opacity(0.04), radius: 8, y: 4)
    }
}
