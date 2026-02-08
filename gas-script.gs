/**
 * ブラウザから直接アクセス（GET）された場合の処理
 */
function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script は正常に動作しています。フォームからの送信（POSTリクエスト）をお待ちしています。")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * フォームの送信データを受け取り、メール送信およびスプレッドシートへの記録を行います。
 */
function doPost(e) {
  try {
    // 1. データの解析
    var params = JSON.parse(e.postData.contents);
    
    // スプレッドシートへの記録（シートがある場合）
    try {
      recordToSheet(params);
    } catch (err) {
      console.error("Spreadsheet error: " + err);
    }

    // 2. 自分宛てのメール送信
    sendAdminEmail(params);

    // 3. 相手宛ての自動返信（任意）
    // sendAutoReply(params);

    // 成功レスポンス
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // 失敗レスポンス
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 管理者（あなた）宛てに詳細メールを送ります。
 */
function sendAdminEmail(p) {
  try {
    var myEmail = "asagimuu1101@gmail.com"; // あなたのメールアドレスを直接指定
    var subject = "【ポートフォリオ】新規ご依頼：" + p.name + " 様 (" + p.plan_label + ")";
    
    var body = "ポートフォリオサイトから新しいご依頼が届きました。\n\n";
    body += "--------------------------------------------------\n";
    body += "■ 基本情報\n";
    body += "--------------------------------------------------\n";
    body += "【プラン】: " + p.plan_label + "\n";
    if (p.company_name) body += "【貴社名】: " + p.company_name + "\n";
    if (p.department) body += "【部署名】: " + p.department + "\n";
    body += "【お名前】: " + p.name + "\n";
    body += "【メール】: " + p.email + "\n";
    body += "【連絡方法】: " + p.contact_method + " (" + (p.user_id || "なし") + ")\n";
    body += "【使用用途】: " + (p.usage || "法人案件") + "\n";
    body += "【合計枚数】: " + p.request_count + " 枚\n\n";

    body += "--------------------------------------------------\n";
    body += "■ ご依頼詳細\n";
    body += "--------------------------------------------------\n";
    
    // 各枚数の詳細をループ
    p.details_list.forEach(function(item, index) {
      body += "【" + (index + 1) + "枚目】\n";
      body += "  - 種別: " + item.request_type.join(", ") + "\n";
      body += "  - 用途: " + (item.commercial_use === "Commercial" ? "商用利用" : "個人使用") + "\n";
      body += "  - 詳細: " + item.details + "\n";
      body += "  - カラー: " + item.color_mode + "\n";
      body += "  - サイズ: " + item.canvas_size + (item.orientation ? " (" + item.orientation + ")" : "") + (item.other_size ? " (" + item.other_size + ")" : "") + "\n";
      body += "  - 形式: " + item.file_format.join(", ") + (item.file_format_other ? " (" + item.file_format_other + ")" : "") + "\n\n";
    });

    body += "--------------------------------------------------\n";
    body += "■ 補足・お支払い\n";
    body += "--------------------------------------------------\n";
    body += "【参考URL】: " + (p.reference || "なし") + "\n";
    body += "【希望納期】: " + p.deadline + "\n";
    body += "【支払方法】: " + p.payment_method + "\n";
    body += "【実績公開】: " + p.publication + (p.publication_date ? " (公開可能日: " + p.publication_date + ")" : "") + (p.publication_other ? " (" + p.publication_other + ")" : "") + "\n";
    body += "【著作権譲渡】: " + (p.copyright_transfer === "Yes" ? "希望する" : "希望しない") + "\n";
    body += "【備考・質問】: \n" + (p.remarks || "なし") + "\n";

    MailApp.sendEmail({
      to: myEmail,
      subject: subject,
      body: body,
      replyTo: p.email
    });
    
    console.log("Email sent successfully to: " + myEmail);
  } catch (error) {
    console.error("Email sending failed: " + error.toString());
    throw error; // エラーを上位に伝播させる
  }
}

/**
 * スプレッドシートの先頭行に記録します。
 * スクリプトが紐付いているスプレッドシートの1番目のシートを使います。
 */
function recordToSheet(p) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return; // 紐付いたシートがない場合はスキップ
  var sheet = ss.getSheets()[0];
  
  // 1行目に書き込むデータ
  var row = [
    new Date(), // 送信日時
    p.plan_label,
    p.name,
    p.email,
    p.contact_method,
    p.deadline,
    p.usage || "法人",
    p.request_count,
    JSON.stringify(p.details_list), // 詳細はJSONのまま記録（または分割して記録）
    p.remarks
  ];
  
  sheet.appendRow(row);
}
