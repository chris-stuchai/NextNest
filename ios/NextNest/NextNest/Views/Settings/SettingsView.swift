import SwiftUI

/// Settings screen with account management.
struct SettingsView: View {
    @EnvironmentObject private var auth: AuthManager
    @EnvironmentObject private var haptics: HapticManager
    @State private var showSignOutConfirmation = false
    @State private var showDeleteConfirmation = false
    @State private var showPasswordSheet = false

    var body: some View {
        NavigationStack {
            List {
                accountSection
                toolsSection
                aboutSection
                dangerZone
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .confirmationDialog("Sign Out", isPresented: $showSignOutConfirmation) {
                Button("Sign Out", role: .destructive) {
                    haptics.impact()
                    Task { await auth.signOut() }
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .confirmationDialog("Delete Account", isPresented: $showDeleteConfirmation) {
                Button("Delete My Account", role: .destructive) {
                    haptics.heavyImpact()
                    Task {
                        try? await APIClient.shared.deleteAccount()
                        await auth.signOut()
                    }
                }
            } message: {
                Text("This will permanently delete your account and all associated data. This cannot be undone.")
            }
            .sheet(isPresented: $showPasswordSheet) {
                ChangePasswordSheet()
            }
        }
    }

    private var accountSection: some View {
        Section("Account") {
            NavigationLink {
                ProfileView()
            } label: {
                HStack(spacing: Theme.Spacing.md) {
                    ZStack {
                        Circle()
                            .fill(Theme.accentLight)
                            .frame(width: 44, height: 44)
                        Text(initials)
                            .font(.headline)
                            .foregroundStyle(Theme.accent)
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text(auth.currentUser?.name ?? "User")
                            .font(.headline)
                        Text(auth.currentUser?.email ?? "")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, Theme.Spacing.xs)
            }

            Button {
                showPasswordSheet = true
            } label: {
                Label("Change Password", systemImage: "lock.fill")
            }
        }
    }

    private var toolsSection: some View {
        Section("Tools") {
            NavigationLink { ChecklistView() } label: {
                Label("Pre-Move Checklist", systemImage: "checklist")
            }
            NavigationLink { MoversView() } label: {
                Label("Find Movers", systemImage: "truck.box.fill")
            }
            NavigationLink { QuotesView() } label: {
                Label("Moving Quotes", systemImage: "phone.arrow.up.right")
            }
            NavigationLink { LeaseView() } label: {
                Label("Lease Analysis", systemImage: "doc.text.magnifyingglass")
            }
            NavigationLink { PhotosView() } label: {
                Label("Move-Out Photos", systemImage: "camera.fill")
            }
            NavigationLink { ExpensesView() } label: {
                Label("Expenses", systemImage: "creditcard")
            }
            NavigationLink { NeighborhoodView() } label: {
                Label("Neighborhood Compare", systemImage: "map.fill")
            }
        }
    }

    private var aboutSection: some View {
        Section("About") {
            LabeledContent("Version", value: appVersion)
            Link(destination: URL(string: "https://nextnest-web-production.up.railway.app/privacy")!) {
                Label("Privacy Policy", systemImage: "hand.raised.fill")
            }
            Link(destination: URL(string: "https://nextnest-web-production.up.railway.app/terms")!) {
                Label("Terms of Service", systemImage: "doc.text.fill")
            }
        }
    }

    private var dangerZone: some View {
        Section {
            Button(role: .destructive) {
                haptics.warning()
                showSignOutConfirmation = true
            } label: {
                Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
            }
            Button(role: .destructive) {
                haptics.warning()
                showDeleteConfirmation = true
            } label: {
                Label("Delete Account", systemImage: "trash.fill")
            }
        }
    }

    private var initials: String {
        guard let name = auth.currentUser?.name, !name.isEmpty else { return "?" }
        let parts = name.split(separator: " ")
        let first = parts.first.map { String($0.prefix(1)) } ?? ""
        let last = parts.count > 1 ? String(parts.last!.prefix(1)) : ""
        return (first + last).uppercased()
    }

    private var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
}

struct ChangePasswordSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var haptics: HapticManager
    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isSaving = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Current Password") {
                    SecureField("Current password", text: $currentPassword)
                }
                Section("New Password") {
                    SecureField("New password (min 8 characters)", text: $newPassword)
                    SecureField("Confirm password", text: $confirmPassword)
                }
                if let error {
                    Section { Text(error).foregroundStyle(.red).font(.caption) }
                }
            }
            .navigationTitle("Change Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(newPassword.count < 8 || newPassword != confirmPassword || isSaving)
                }
            }
        }
    }

    private func save() async {
        isSaving = true
        error = nil
        do {
            try await APIClient.shared.changePassword(
                currentPassword: currentPassword.isEmpty ? nil : currentPassword,
                newPassword: newPassword
            )
            haptics.success()
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSaving = false
        }
    }
}
