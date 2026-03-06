import SwiftUI
import PhotosUI

/// Move-out photo documentation grouped by room.
struct PhotosView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var photos: [MovePhoto] = []
    @State private var isLoading = true
    @State private var showAddSheet = false

    var photosByRoom: [(String, [MovePhoto])] {
        Dictionary(grouping: photos, by: \.room)
            .sorted { $0.key < $1.key }
    }

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if photos.isEmpty {
                emptyState
            } else {
                photoList
            }
        }
        .navigationTitle("Move-Out Photos")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showAddSheet = true } label: {
                    Image(systemName: "camera.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showAddSheet) {
            AddPhotoSheet { await loadPhotos() }
        }
        .task { await loadPhotos() }
    }

    private var photoList: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                Text("\(photos.count) photos documented")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ForEach(photosByRoom, id: \.0) { room, roomPhotos in
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        HStack {
                            Image(systemName: "door.left.hand.open")
                                .foregroundStyle(Theme.accent)
                            Text(room)
                                .font(.headline)
                            Spacer()
                            Text("\(roomPhotos.count)")
                                .font(.caption.weight(.medium))
                                .foregroundStyle(.secondary)
                        }
                        ForEach(roomPhotos) { photo in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    if let caption = photo.caption, !caption.isEmpty {
                                        Text(caption).font(.subheadline)
                                    }
                                    Text(formattedDate(photo.createdAt))
                                        .font(.caption)
                                        .foregroundStyle(.tertiary)
                                }
                                Spacer()
                                Button(role: .destructive) {
                                    Task { await deletePhoto(photo) }
                                } label: {
                                    Image(systemName: "trash")
                                        .font(.caption)
                                        .foregroundStyle(.red)
                                }
                            }
                            .padding(.vertical, Theme.Spacing.xs)
                        }
                    }
                    .cardStyle()
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .refreshable { await loadPhotos() }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "camera.fill")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No photos yet")
                .font(.headline)
            Text("Document the condition of each room before you move out.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Add Photo") { showAddSheet = true }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
        }
        .padding(Theme.Spacing.xxl)
    }

    private func loadPhotos() async {
        do {
            photos = try await APIClient.shared.fetchPhotos()
            isLoading = false
        } catch { isLoading = false }
    }

    private func deletePhoto(_ photo: MovePhoto) async {
        haptics.impact()
        photos.removeAll { $0.id == photo.id }
        do { try await APIClient.shared.deletePhoto(id: photo.id) }
        catch { await loadPhotos() }
    }

    private func formattedDate(_ iso: String) -> String {
        let f = ISO8601DateFormatter()
        guard let date = f.date(from: iso) else { return iso }
        let df = DateFormatter()
        df.dateFormat = "MMM d, h:mm a"
        return df.string(from: date)
    }
}

struct AddPhotoSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var haptics: HapticManager
    let onSave: () async -> Void

    @State private var room = "Living Room"
    @State private var caption = ""
    @State private var selectedItem: PhotosPickerItem?
    @State private var imageData: Data?
    @State private var isSaving = false

    let rooms = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Hallway", "Closet", "Garage", "Patio", "Other"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Room") {
                    Picker("Room", selection: $room) {
                        ForEach(rooms, id: \.self) { Text($0) }
                    }
                }
                Section("Photo") {
                    PhotosPicker(selection: $selectedItem, matching: .images) {
                        Label(imageData != nil ? "Photo selected" : "Choose Photo",
                              systemImage: imageData != nil ? "checkmark.circle.fill" : "photo")
                    }
                    .onChange(of: selectedItem) { item in
                        Task {
                            if let data = try? await item?.loadTransferable(type: Data.self) {
                                imageData = data
                            }
                        }
                    }
                }
                Section("Caption") {
                    TextField("Optional caption", text: $caption)
                }
            }
            .navigationTitle("Add Photo")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(imageData == nil || isSaving)
                }
            }
        }
    }

    private func save() async {
        guard let data = imageData else { return }
        isSaving = true
        let base64 = data.base64EncodedString()
        let req = PhotoUploadRequest(
            room: room,
            caption: caption.isEmpty ? nil : caption,
            imageData: base64
        )
        do {
            _ = try await APIClient.shared.uploadPhoto(req)
            haptics.success()
            await onSave()
            dismiss()
        } catch { isSaving = false }
    }
}
