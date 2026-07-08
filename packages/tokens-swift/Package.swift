// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "OrigonTokens",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
    ],
    products: [
        .library(name: "OrigonTokens", targets: ["OrigonTokens"]),
    ],
    targets: [
        .target(
            name: "OrigonTokens",
            path: "Sources/OrigonTokens",
            resources: [
                .process("Resources"),
            ]
        ),
    ]
)
