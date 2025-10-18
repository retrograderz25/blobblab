
### User Stories cho Game Puzzle kết hợp Block Blast và 2048 tên là blob blab

**Epic:** Lối chơi cốt lõi (Core Gameplay)

---

**User Story 1: Thiết lập Bàn cờ**

*   **Là một** người chơi,
*   **Tôi muốn** bắt đầu một ván chơi mới trên một bàn cờ hình vuông,
*   **Để** có không gian sắp xếp và ghi điểm.

**Tiêu chí chấp nhận (Acceptance Criteria):**
*   Khi bắt đầu game, một bàn cờ hình vuông được hiển thị.
*   Mặc định, bàn cờ có kích thước là 16x16 ô.
*   Bàn cờ phải được hiển thị rõ ràng, phân chia thành các ô lưới (grid).
*   Giao diện phải hiển thị điểm số hiện tại, ban đầu là 0.

---

**User Story 2: Block tự động xuất hiện**

*   **Là một** người chơi,
*   **Tôi muốn** các khối (block) mới tự động xuất hiện ngẫu nhiên trên bàn cờ sau mỗi lượt đi,
*   **Để** tạo ra thử thách và duy trì tiến trình của trò chơi.

**Tiêu chí chấp nhận (Acceptance Criteria):**
*   Khi bắt đầu ván chơi, một số lượng block ngẫu nhiên (ví dụ: 2-3 block) sẽ xuất hiện trên các ô trống của bàn cờ.
*   Sau mỗi lần người chơi thực hiện thao tác vuốt hợp lệ, một hoặc nhiều block mới sẽ xuất hiện ở các vị trí ngẫu nhiên còn trống.
*   Các block mới không bao giờ được xuất hiện ở một ô đã có block.
*   Các block có thể có hình dạng và màu sắc đa dạng giống như trong các game xếp gạch cổ điển (hình vuông, chữ L, chữ T, v.v.), nhưng ban đầu chúng chỉ chiếm 1 ô để đơn giản hóa. *(Ghi chú cho dev: Có thể mở rộng thành các block đa ô trong các phiên bản sau).*

---

**User Story 3: Điều khiển bằng thao tác vuốt**

*   **Là một** người chơi,
*   **Tôi muốn** có thể vuốt màn hình theo bốn hướng (lên, xuống, trái, phải) để di chuyển tất cả các khối trên bàn cờ,
*   **Để** sắp xếp chúng thành các hàng và cột hoàn chỉnh.

**Tiêu chí chấp nhận (Acceptance Criteria):**
*   Khi người chơi vuốt lên, tất cả các khối trên bàn cờ sẽ di chuyển lên phía trên cho đến khi chạm vào cạnh trên của bàn cờ hoặc một khối khác.
*   Khi người chơi vuốt xuống, tất cả các khối trên bàn cờ sẽ di chuyển xuống phía dưới cho đến khi chạm vào cạnh dưới của bàn cờ hoặc một khối khác.
*   Khi người chơi vuốt sang trái, tất cả các khối trên bàn cờ sẽ di chuyển sang trái cho đến khi chạm vào cạnh trái của bàn cờ hoặc một khối khác.
*   Khi người chơi vuốt sang phải, tất cả các khối trên bàn cờ sẽ di chuyển sang phải cho đến khi chạm vào cạnh phải của bàn cờ hoặc một khối khác.
*   Nếu một thao tác vuốt không làm thay đổi vị trí của bất kỳ khối nào, nó sẽ không được tính là một lượt đi (và không có block mới nào xuất hiện).

---

**User Story 4: Ghi điểm bằng cách lấp đầy hàng/cột**

*   **Là một** người chơi,
*   **Tôi muốn** một hàng hoặc một cột sẽ tự động biến mất khi nó được lấp đầy bởi các khối, và tôi sẽ nhận được điểm,
*   **Để** có mục tiêu rõ ràng và cảm giác thỏa mãn khi chơi.

**Tiêu chí chấp nhận (Acceptance Criteria):**
*   Sau khi người chơi hoàn thành một lượt vuốt, hệ thống sẽ kiểm tra tất cả các hàng và cột trên bàn cờ.
*   Nếu có bất kỳ hàng ngang nào được lấp đầy hoàn toàn bởi các khối, hàng đó sẽ được xóa khỏi bàn cờ.
*   Nếu có bất kỳ cột dọc nào được lấp đầy hoàn toàn bởi các khối, cột đó sẽ được xóa khỏi bàn cờ.
*   Người chơi sẽ nhận được điểm cho mỗi hàng hoặc cột được xóa.
*   Xóa nhiều hàng/cột cùng một lúc (combo) sẽ nhận được điểm thưởng.
*   Điểm số của người chơi phải được cập nhật ngay lập tức trên giao diện.
*   Phải có hiệu ứng hình ảnh và âm thanh rõ ràng khi một hàng/cột được xóa để tạo sự hứng khởi.

---

**User Story 5: Điều chỉnh độ khó**

*   **Là một** người chơi,
*   **Tôi muốn** có thể chọn kích thước bàn cờ trước khi bắt đầu chơi (ví dụ: 8x8, 12x12, 16x16),
*   **Để** điều chỉnh độ khó của trò chơi cho phù hợp với kỹ năng của mình.

**Tiêu chí chấp nhận (Acceptance Criteria):**
*   Trong màn hình menu chính hoặc trước khi bắt đầu ván mới, có một tùy chọn cho phép người chơi chọn kích thước bàn cờ.
*   Các tùy chọn kích thước có thể là: Dễ (8x8), Trung bình (12x12), Khó (16x16).
*   Lối chơi cốt lõi (xuất hiện block, vuốt, xóa hàng/cột) phải hoạt động chính xác với mọi kích thước bàn cờ được chọn.

---

**User Story 6: Điều kiện kết thúc trò chơi**

*   **Là một** người chơi,
*   **Tôi muốn** trò chơi kết thúc khi không còn ô trống nào trên bàn cờ và không thể thực hiện thêm nước đi nào,
*   **Để** biết được khi nào mình thua và có thể bắt đầu lại.

**Tiêu chí chấp nhận (Acceptance Criteria):**
*   Sau khi một khối mới xuất hiện, hệ thống sẽ kiểm tra xem bàn cờ đã đầy chưa.
*   Nếu bàn cờ đã đầy, hệ thống tiếp tục kiểm tra xem người chơi có thể thực hiện bất kỳ thao tác vuốt nào để xóa hàng/cột hay không.
*   Nếu không thể thực hiện thêm nước đi nào, màn hình "Game Over" sẽ được hiển thị.
*   Màn hình "Game Over" phải hiển thị điểm số cuối cùng của người chơi và có các tùy chọn như "Chơi lại" hoặc "Quay về Menu".

---

Hy vọng những user story này sẽ giúp đội ngũ phát triển của bạn có một cái nhìn rõ ràng và chi tiết về sản phẩm cần xây dựng. Chúc dự án game của bạn thành công