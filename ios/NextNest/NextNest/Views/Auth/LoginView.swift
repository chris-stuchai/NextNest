import SwiftUI

/// Authentication screen with sign in and registration.
struct LoginView: View {
    @EnvironmentObject private var auth: AuthManager
    @EnvironmentObject private var haptics: HapticManager

    @State private var isRegistering = false
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.xl) {
                    header
                    formFields
                    actionButton
                    toggleMode
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.xxl)
            }
            .background(Theme.background)
            .navigationBarHidden(true)
        }
    }

    private var header: some View {
        VStack(spacing: Theme.Spacing.md) {
            ZStack {
                Circle()
                    .fill(Theme.accentLight)
                    .frame(width: 88, height: 88)
                Image(systemName: "house.fill")
                    .font(.system(size: 36, weight: .medium))
                    .foregroundStyle(Theme.accent)
            }

            Text(isRegistering ? "Create Account" : "Welcome Back")
                .font(.system(size: 28, weight: .bold, design: .rounded))

            Text(isRegistering
                 ? "Start planning your perfect move"
                 : "Sign in to your relocation plan")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var formFields: some View {
        VStack(spacing: Theme.Spacing.md) {
            if isRegistering {
                InputField(icon: "person.fill", placeholder: "Full name", text: $name)
                    .textContentType(.name)
                    .autocorrectionDisabled()
            }
            InputField(icon: "envelope.fill", placeholder: "Email", text: $email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()

            InputField(icon: "lock.fill", placeholder: "Password", text: $password, isSecure: true)
                .textContentType(isRegistering ? .newPassword : .password)

            if let error = auth.error {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, Theme.Spacing.xs)
            }
        }
    }

    private var actionButton: some View {
        Button {
            haptics.impact()
            Task {
                if isRegistering {
                    await auth.register(name: name, email: email, password: password)
                } else {
                    await auth.signIn(email: email, password: password)
                }
            }
        } label: {
            Group {
                if auth.isLoading {
                    ProgressView().tint(.white)
                } else {
                    Text(isRegistering ? "Create Account" : "Sign In")
                        .font(.headline)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Theme.accent)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
        }
        .disabled(auth.isLoading || email.isEmpty || password.isEmpty)
        .opacity(email.isEmpty || password.isEmpty ? 0.6 : 1)
    }

    private var toggleMode: some View {
        Button {
            haptics.select()
            withAnimation(.easeInOut(duration: 0.2)) {
                isRegistering.toggle()
                auth.error = nil
            }
        } label: {
            HStack(spacing: 4) {
                Text(isRegistering ? "Already have an account?" : "Don't have an account?")
                    .foregroundStyle(.secondary)
                Text(isRegistering ? "Sign In" : "Sign Up")
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.accent)
            }
            .font(.subheadline)
        }
    }
}

/// Reusable input field with icon.
struct InputField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var isSecure = false

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .foregroundStyle(.secondary)
                .frame(width: 20)
            if isSecure {
                SecureField(placeholder, text: $text)
            } else {
                TextField(placeholder, text: $text)
            }
        }
        .padding(Theme.Spacing.md)
        .background(Theme.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
    }
}
