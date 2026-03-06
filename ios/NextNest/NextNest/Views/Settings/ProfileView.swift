import SwiftUI

/// Profile editing screen.
struct ProfileView: View {
    @EnvironmentObject private var auth: AuthManager
    @EnvironmentObject private var haptics: HapticManager
    @State private var name = ""
    @State private var isSaving = false
    @State private var saved = false

    var body: some View {
        Form {
            Section("Profile") {
                HStack {
                    Spacer()
                    ZStack {
                        Circle()
                            .fill(Theme.accentLight)
                            .frame(width: 80, height: 80)
                        Text(initials)
                            .font(.title.weight(.bold))
                            .foregroundStyle(Theme.accent)
                    }
                    Spacer()
                }
                .listRowBackground(Color.clear)

                TextField("Display name", text: $name)
                    .textContentType(.name)

                LabeledContent("Email", value: auth.currentUser?.email ?? "")
            }

            Section {
                Button {
                    haptics.impact()
                    Task { await saveName() }
                } label: {
                    HStack {
                        Spacer()
                        if isSaving {
                            ProgressView()
                        } else if saved {
                            Label("Saved!", systemImage: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                        } else {
                            Text("Save Changes")
                        }
                        Spacer()
                    }
                }
                .disabled(name.isEmpty || isSaving)
            }
        }
        .navigationTitle("Profile")
        .onAppear { name = auth.currentUser?.name ?? "" }
    }

    private var initials: String {
        let parts = name.split(separator: " ")
        let first = parts.first.map { String($0.prefix(1)) } ?? "?"
        let last = parts.count > 1 ? String(parts.last!.prefix(1)) : ""
        return (first + last).uppercased()
    }

    private func saveName() async {
        isSaving = true
        do {
            try await APIClient.shared.updateProfile(name: name)
            haptics.success()
            saved = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) { saved = false }
        } catch {}
        isSaving = false
    }
}
