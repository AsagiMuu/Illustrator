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
    // 1. データの解析 (JSON形式またはフォーム形式の両方をサポート)
    var params;
    if (e.postData && e.postData.contents) {
      // fetch(..., {body: JSON.stringify(data)}) の場合
      params = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.payload) {
      // 隠しiframeフォーム送信の場合
      params = JSON.parse(e.parameter.payload);
    } else {
      throw new Error("Invalid request: No data received.");
    }
    
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

    // 成功時：親ウィンドウ（form.html）に成功を通知するHTMLを返す
    return HtmlService.createHtmlOutput(
      "<script>window.parent.postMessage({target: 'gas_form', result: 'success'}, '*');</script>"
    );

  } catch (err) {
    console.error("Critical error: " + err.toString());
    // 失敗時：親ウィンドウに失敗を通知するHTMLを返す
    return HtmlService.createHtmlOutput(
      "<script>window.parent.postMessage({target: 'gas_form', result: 'error', message: '" + err.toString().replace(/'/g, "\\'") + "'}, '*');</script>"
    );
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
      body += "  - 参考画像URL: " + (item.image_reference_url || "なし") + "\n";
      body += "  - イメージ説明: " + (item.image_reference_text || "なし") + "\n";
      if (item.background_option) {
        body += "  - 背景: " + item.background_option + "\n";
        if (item.background_option === '有り' && item.background_text) {
             body += "  - 背景詳細: " + item.background_text + "\n";
        }
      }
      body += "  - 形式: " + item.file_format.join(", ") + (item.file_format_other ? " (" + item.file_format_other + ")" : "") + "\n\n";
    });

    body += "--------------------------------------------------\n";
    body += "■ 補足・お支払い\n";
    body += "--------------------------------------------------\n";
    body += "【参考URL】: " + (p.reference || "なし") + "\n";
    body += "【希望納期】: " + p.deadline + "\n";
    body += "【支払方法】: " + p.payment_method + "\n";
    var pubText = p.publication === 'Allow' ? '許可' : (p.publication === 'Prohibit' ? '禁止' : 'その他');
    if (p.publication === 'Allow') {
      if (p.publication_places && p.publication_places.length > 0) {
        var placeMap = { 'SNS': 'SNS', 'Portfolio': 'ポートフォリオ', 'Homepage': 'ホームページ' };
        var places = p.publication_places.map(function(pl) { return placeMap[pl] || pl; });
        pubText += " [場所: " + places.join(", ") + "]";
      }
      pubText += " [公開日: " + (p.publication_date || "未定") + "]";
    } else if (p.publication === 'Other' && p.publication_other) {
      pubText += " (" + p.publication_other + ")";
    }
    body += "【実績公開】: " + pubText + "\n";
    body += "【著作権譲渡】: " + (p.copyright_transfer === "Yes" ? "希望する" : "希望しない") + "\n";
    body += "【備考・質問】: \n" + (p.remarks || "なし") + "\n";

    // メール送信（PDF添付なし）
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

/**
 * 日付を指定されたフォーマットで整形します。
 */
function formatDate(date, format) {
  if (!date) {
    date = new Date();
  }
  return Utilities.formatDate(date, "JST", format || "yyyy年MM月dd日");
}

/**
 * 金額を計算します（仮実装）
 * 実際のプランに基づく料金計算ロジックをここに実装してください。
 */
function calculatePrice(planLabel, requestCount, usage) {
  // 仮の料金設定
  var basePrice = 50000; // 基本料金
  
  // 使用用途による調整（商用利用の場合は2倍）
  if (usage && (usage.includes("法人") || usage.includes("商用"))) {
    basePrice = basePrice * 2;
  }
  
  // 枚数による計算
  var subtotal = basePrice * (requestCount || 1);
  var tax = Math.floor(subtotal * 0.1); // 消費税10%
  var total = subtotal + tax;
  
  return {
    subtotal: subtotal.toLocaleString(),
    tax: tax.toLocaleString(),
    total: total.toLocaleString(),
    estimatedPrice: total.toLocaleString()
  };
}
