import Foundation
import SwiftUI

/// Manages authentication state across the app.
@MainActor
final class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var currentUser: AuthUser?
    @Published var isAuthenticated = false
    @Published var isLoading = true
    @Published var error: String?

    private init() {}

    /// Check for existing session on app launch.
    func checkSession() async {
        isLoading = true
        defer { isLoading = false }
        do {
            if let user = try await APIClient.shared.fetchSession() {
                currentUser = user
                isAuthenticated = true
            }
        } catch {
            isAuthenticated = false
        }
    }

    func register(name: String, email: String, password: String) async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            _ = try await APIClient.shared.register(name: name, email: email, password: password)
            try await APIClient.shared.signIn(email: email, password: password)
            if let user = try await APIClient.shared.fetchSession() {
                currentUser = user
                isAuthenticated = true
            }
        } catch let err as APIError {
            self.error = err.localizedDescription
        } catch {
            self.error = "Registration failed. Please try again."
        }
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            try await APIClient.shared.signIn(email: email, password: password)
            if let user = try await APIClient.shared.fetchSession() {
                currentUser = user
                isAuthenticated = true
            } else {
                self.error = "Invalid email or password."
            }
        } catch APIError.unauthorized {
            self.error = "Invalid email or password."
        } catch {
            self.error = "Sign in failed. Please try again."
        }
    }

    func signOut() async {
        do {
            try await APIClient.shared.signOut()
        } catch {}
        currentUser = nil
        isAuthenticated = false
    }
}
