# express_socket



客戶端連線的時候，服務端主動發送一個事件，告訴客戶端是否已經啟動計時器，如果開啟則不再啟動，如果沒有啟動，找到這個modifyCode房間，並且針對modifyCode房間找到的第一個socket.id啟動計時器。

當有10個用戶的時候，如何在服務器端判斷這10個人，在特定秒數內是否有接收到計時器

難點:
1. 每個人的啟動計時器秒數都不一樣

解決方法:
1. 當創新一個房間的時候，就新增(監聽)一個事件，並且啟動計時器在X秒內沒有收到用戶傳來的通知，先查看這個房間的人還在不再。

 * 存在:
	* 針對找出的第一個socket.id，詢問是否開啟計時器。
 		* 開啟:
   			* 表示前端有收到這個通知，並重新自動打開計時器
 		* 不開啟:
  			* 表示用戶可能處於非活躍狀態，關閉特定值
* 不存在:
清除特定值(前端在每次打開這個頁面都要呼叫這隻API)
