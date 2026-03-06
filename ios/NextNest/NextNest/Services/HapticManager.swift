import SwiftUI

/// Centralized haptic feedback for native interactions.
@MainActor
final class HapticManager: ObservableObject {
    static let shared = HapticManager()

    private let light = UIImpactFeedbackGenerator(style: .light)
    private let medium = UIImpactFeedbackGenerator(style: .medium)
    private let heavy = UIImpactFeedbackGenerator(style: .heavy)
    private let notification = UINotificationFeedbackGenerator()
    private let selection = UISelectionFeedbackGenerator()

    private init() {
        light.prepare()
        medium.prepare()
        selection.prepare()
    }

    func tap() { light.impactOccurred() }
    func impact() { medium.impactOccurred() }
    func heavyImpact() { heavy.impactOccurred() }
    func success() { notification.notificationOccurred(.success) }
    func warning() { notification.notificationOccurred(.warning) }
    func error() { notification.notificationOccurred(.error) }
    func select() { selection.selectionChanged() }
}
