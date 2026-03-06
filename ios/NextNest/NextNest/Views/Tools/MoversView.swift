import SwiftUI

/// AI-powered mover recommendations.
struct MoversView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var movers: [MoverRecommendation] = []
    @State private var isLoading = false
    @State private var hasLoaded = false
    @State private var error: String?

    var body: some View {
        Group {
            if isLoading {
                VStack(spacing: Theme.Spacing.md) {
                    ProgressView()
                    Text("AI is finding the best movers for your route...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(Theme.Spacing.xxl)
            } else if movers.isEmpty && !hasLoaded {
                emptyState
            } else if movers.isEmpty {
                noResults
            } else {
                moverList
            }
        }
        .navigationTitle("Find Movers")
    }

    private var moverList: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                ForEach(movers) { mover in
                    MoverCard(mover: mover)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .refreshable { await loadMovers() }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "truck.box.fill")
                .font(.system(size: 48))
                .foregroundStyle(Theme.accent)
            Text("Find Your Movers")
                .font(.title3.weight(.bold))
            Text("AI will analyze your route, budget, and needs to recommend the best moving companies.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button {
                haptics.impact()
                Task { await loadMovers() }
            } label: {
                Label("Find My Movers", systemImage: "sparkles")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Theme.accent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
            }
            .padding(.top, Theme.Spacing.sm)
        }
        .padding(Theme.Spacing.xxl)
    }

    private var noResults: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundStyle(.orange)
            Text("No recommendations available")
                .font(.headline)
            if let error { Text(error).font(.caption).foregroundStyle(.secondary) }
            Button("Try Again") { Task { await loadMovers() } }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
        }
        .padding(Theme.Spacing.xxl)
    }

    private func loadMovers() async {
        isLoading = true
        error = nil
        do {
            movers = try await APIClient.shared.fetchMoverRecommendations()
            hasLoaded = true
        } catch {
            self.error = error.localizedDescription
            hasLoaded = true
        }
        isLoading = false
    }
}

struct MoverCard: View {
    let mover: MoverRecommendation
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text(mover.name)
                        .font(.headline)
                    Text(mover.type.replacingOccurrences(of: "-", with: " ").capitalized)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(mover.priceRange)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.accent)
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundStyle(.yellow)
                        Text(String(format: "%.1f", mover.rating))
                            .font(.caption)
                    }
                }
            }

            Text(mover.bestFor)
                .font(.caption)
                .foregroundStyle(.secondary)

            if isExpanded {
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    if !mover.pros.isEmpty {
                        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                            Text("Pros").font(.caption.weight(.semibold)).foregroundStyle(.green)
                            ForEach(mover.pros, id: \.self) { pro in
                                Label(pro, systemImage: "plus.circle.fill")
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                    if !mover.cons.isEmpty {
                        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                            Text("Cons").font(.caption.weight(.semibold)).foregroundStyle(.orange)
                            ForEach(mover.cons, id: \.self) { con in
                                Label(con, systemImage: "minus.circle.fill")
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                    HStack(spacing: Theme.Spacing.md) {
                        if !mover.phone.isEmpty {
                            Link(destination: URL(string: "tel:\(mover.phone)")!) {
                                Label("Call", systemImage: "phone.fill")
                                    .font(.caption.weight(.medium))
                            }
                        }
                        if !mover.website.isEmpty, let url = URL(string: mover.website) {
                            Link(destination: url) {
                                Label("Website", systemImage: "safari.fill")
                                    .font(.caption.weight(.medium))
                            }
                        }
                    }
                    .padding(.top, Theme.Spacing.xs)
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            Button {
                withAnimation(.spring(response: 0.3)) { isExpanded.toggle() }
            } label: {
                Text(isExpanded ? "Show Less" : "Show More")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Theme.accent)
            }
        }
        .cardStyle()
    }
}
