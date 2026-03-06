import SwiftUI

/// AI neighborhood comparison — origin vs destination. Persists after generation.
struct NeighborhoodView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var data: NeighborhoodData?
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        Group {
            if isLoading {
                loadingState
            } else if let data {
                comparisonContent(data)
            } else {
                emptyState
            }
        }
        .navigationTitle("Neighborhood Compare")
        .onAppear { loadSaved() }
    }

    private var loadingState: some View {
        VStack(spacing: Theme.Spacing.md) {
            ProgressView()
            Text("Comparing neighborhoods...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func comparisonContent(_ data: NeighborhoodData) -> some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                // Mobile-first: stacked cards instead of side-by-side
                VStack(spacing: Theme.Spacing.md) {
                    locationCard(data.origin, icon: "arrow.up.right.circle.fill")
                    locationCard(data.destination, icon: "mappin.circle.fill")
                }

                if !data.keyDifferences.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        Text("Key Differences")
                            .font(.headline)
                        ForEach(data.keyDifferences, id: \.self) { diff in
                            HStack(alignment: .top, spacing: Theme.Spacing.sm) {
                                Image(systemName: "arrow.left.arrow.right")
                                    .font(.caption)
                                    .foregroundStyle(Theme.accent)
                                Text(diff)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cardStyle()
                }

                if !data.tips.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        Text("Tips")
                            .font(.headline)
                        ForEach(data.tips, id: \.self) { tip in
                            HStack(alignment: .top, spacing: Theme.Spacing.sm) {
                                Image(systemName: "lightbulb.fill")
                                    .font(.caption)
                                    .foregroundStyle(.yellow)
                                Text(tip)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cardStyle()
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button {
                        haptics.impact()
                        Task { await loadComparison() }
                    } label: {
                        Label("Regenerate Comparison", systemImage: "arrow.clockwise")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle").font(.body)
                }
            }
        }
    }

    private func locationCard(_ profile: LocationProfile, icon: String) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack {
                Image(systemName: icon)
                    .font(.body)
                    .foregroundStyle(Theme.accent)
                Text(profile.name)
                    .font(.headline)
            }

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                infoRow(icon: "dollarsign.circle", text: profile.costOfLiving)
                infoRow(icon: "cloud.sun", text: profile.climate)
                infoRow(icon: "bus", text: profile.transitScore)
            }

            if !profile.highlights.isEmpty {
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text("Highlights")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    ForEach(profile.highlights, id: \.self) { h in
                        Text("• \(h)")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private func infoRow(icon: String, text: String) -> some View {
        HStack(alignment: .top, spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(Theme.accent)
                .frame(width: 20, alignment: .center)
            Text(text)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "map.fill")
                .font(.system(size: 48))
                .foregroundStyle(Theme.accent)
            Text("Compare Neighborhoods")
                .font(.title3.weight(.bold))
            Text("See how your current and future neighborhoods stack up. Once generated, it stays saved until you regenerate.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            if let error {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }
            Button {
                haptics.impact()
                Task { await loadComparison() }
            } label: {
                Label("Compare Locations", systemImage: "sparkles")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Theme.accent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
            }
        }
        .padding(Theme.Spacing.xxl)
    }

    private func loadSaved() {
        if let saved = LocalStorage.loadNeighborhood() {
            data = saved
        }
    }

    private func loadComparison() async {
        isLoading = true
        error = nil
        do {
            let result = try await APIClient.shared.fetchNeighborhoodComparison()
            data = result
            LocalStorage.saveNeighborhood(result)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
