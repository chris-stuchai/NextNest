import SwiftUI

@main
struct NextNestApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var haptics = HapticManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(haptics)
                .tint(Theme.accent)
        }
    }
}
