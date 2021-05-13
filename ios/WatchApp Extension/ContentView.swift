//
//  ContentView.swift
//  WatchApp Extension
//
//  Created by 水村宏輔 on 2021/04/08.
//

import SwiftUI
import WatchKit
import WatchConnectivity

final class ListViewModel: NSObject, ObservableObject {
    @Published var messages: [String] = []
    var session: WCSession
    init(session: WCSession  = .default) {
        self.session = session
        super.init()
        self.session.delegate = self
        session.activate()
    }
}

extension ListViewModel: WCSessionDelegate {
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    if let error = error {
      print(error.localizedDescription)
    } else {
      print("The session has completed activation.")
    }
  }
  func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
    DispatchQueue.main.async {
      let received = message["message"] as? String ?? "UMA"
      self.messages.append(received)
      print(received)
    }
  }
}

struct ContentView: View {
  @ObservedObject var viewModal = ListViewModel()

  var body: some View {
    VStack() {
      Text("Hello, World!!!")
        .padding()
      List {
        Button {
          self.sendMessage(index: "Hello iphone")
        } label: {
          Text("Send")
        }
      }
      List {
        ForEach(self.viewModal.messages, id: \.self) { mes in
          Text(mes)
        }
      }
      .listStyle(PlainListStyle())
      Spacer()
    }
  }
  private func sendMessage(index: String) {
    self.viewModal.session.sendMessage([ "message": index ], replyHandler: nil) { (error) in print(error.localizedDescription)
    }
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
      ContentView()
  }
}
