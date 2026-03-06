import SwiftUI

/// Root view that switches between auth and main app experience.
struct ContentView: View {
    @EnvironmentObject private var auth: AuthManager

    var body: some View {
        Group {
            if auth.isLoading {
                LaunchView()
            } else if auth.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: auth.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: auth.isLoading)
        .task { await auth.checkSession() }
    }
}

/// Branded launch/splash screen shown while checking session.
struct LaunchView: View {
    @State private var scale = 0.8

    var body: some View {
        ZStack {
            Theme.accent.ignoresSafeArea()
            VStack(spacing: Theme.Spacing.md) {
                Image(systemName: "house.fill")
                    .font(.system(size: 56, weight: .medium))
                    .foregroundStyle(.white)
                Text("NextNest")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }
            .scaleEffect(scale)
            .onAppear {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    scale = 1.0
                }
            }
        }
    }
}
