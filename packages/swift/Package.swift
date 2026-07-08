// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "OrigonUI",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
    ],
    products: [
        .library(name: "OrigonUI", targets: ["OrigonUI"]),
    ],
    dependencies: [
        .package(path: "../tokens-swift"),
    ],
    targets: [
        .target(
            name: "OrigonUI",
            dependencies: [
                .product(name: "OrigonTokens", package: "tokens-swift"),
            ],
            path: "Sources/OrigonUI"
        ),
        .testTarget(
            name: "OrigonUITests",
            dependencies: [
                "OrigonUI",
                .product(name: "OrigonTokens", package: "tokens-swift"),
            ],
            path: "Tests/OrigonUITests"
        ),
    ]
)
