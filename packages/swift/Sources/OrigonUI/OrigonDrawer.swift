import SwiftUI
import OrigonTokens

/// Origon UI OrigonDrawer — modifier port of the React `<Drawer>`.
/// Uses SwiftUI's native `.sheet` for bottom, custom overlay for right side.
/// Source: Figma `- Drawer` (12:86222).

public enum OrigonDrawerSide { case bottom, right }

public extension View {
    func origonDrawer<Content: View>(
        isPresented: Binding<Bool>,
        side: OrigonDrawerSide = .bottom,
        @ViewBuilder content: @escaping () -> Content
    ) -> some View {
        modifier(OrigonDrawerModifier(isPresented: isPresented, side: side, content: content))
    }
}

struct OrigonDrawerModifier<DrawerContent: View>: ViewModifier {
    @Binding var isPresented: Bool
    let side: OrigonDrawerSide
    @ViewBuilder let content: () -> DrawerContent

    func body(content view: Content) -> some View {
        if side == .bottom {
            return AnyView(
                view.sheet(isPresented: $isPresented) {
                    VStack(spacing: 0) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(OrigonColors.blueGray.s400)
                            .frame(width: 40, height: 4)
                            .padding(.top, OrigonSpacing.sm)
                            .padding(.bottom, OrigonSpacing.xxs)
                        content().padding(OrigonSpacing.md)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(OrigonColors.blueGray.s100)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.hidden)
                }
            )
        }
        return AnyView(
            view.overlay(
                Group {
                    if isPresented {
                        ZStack(alignment: .trailing) {
                            Color.black.opacity(0.6).ignoresSafeArea().onTapGesture { isPresented = false }
                            content()
                                .padding(OrigonSpacing.md)
                                .frame(width: 400)
                                .frame(maxHeight: .infinity, alignment: .topLeading)
                                .background(OrigonColors.blueGray.s100)
                                .clipShape(RoundedCorners(radius: OrigonRadius.xxl, corners: [.topLeft, .bottomLeft]))
                                .transition(.move(edge: .trailing))
                                .ignoresSafeArea()
                        }
                        .animation(.easeOut(duration: 0.22), value: isPresented)
                    }
                }
            )
        )
    }
}

private struct RoundedCorners: Shape {
    var radius: CGFloat
    var corners: UIRectCorner
    func path(in rect: CGRect) -> Path {
        #if os(iOS)
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
        #else
        return Path(roundedRect: rect, cornerRadius: radius)
        #endif
    }
}
