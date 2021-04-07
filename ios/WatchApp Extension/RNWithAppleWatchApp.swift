//
//  RNWithAppleWatchApp.swift
//  WatchApp Extension
//
//  Created by 水村宏輔 on 2021/04/08.
//

import SwiftUI

@main
struct RNWithAppleWatchApp: App {
    @SceneBuilder var body: some Scene {
        WindowGroup {
            NavigationView {
                ContentView()
            }
        }

        WKNotificationScene(controller: NotificationController.self, category: "myCategory")
    }
}
