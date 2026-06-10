# Tong Hop Cong Viec Backend, Thanh Toan VNPay Va Database

Ngay tong hop: 2026-06-10

## 1. Muc Tieu Ban Dau

Muc tieu cua dot lam viec nay la doc lai luong thanh toan, dua thong tin VNPay sandbox vao backend, hoan thien backend thanh toan, tao tai lieu theo Template EDS/TDD, va kiem tra lai database de tranh sai tien, null, du lieu lech hoac fail khi chay.

Pham vi da lam tap trung vao:

- Backend Spring Boot trong folder `Backend`.
- Script SQL Server trong `SQL_DB_RESORT_SPA/resort_spa_db.sql`.
- Luong invoice, thanh toan tien mat, VNPay return/callback/IPN.
- Tai lieu ky thuat thanh toan trong `Backend/docs`.

## 2. Cac File Chinh Da Tao Hoac Sua

### Backend

- `Backend/src/main/java/fu/se/smms/controller/InvoiceController.java`
- `Backend/src/main/java/fu/se/smms/service/InvoiceService.java`
- `Backend/src/main/java/fu/se/smms/service/impl/InvoiceServiceImpl.java`
- `Backend/src/main/java/fu/se/smms/repository/InvoiceRepository.java`
- `Backend/src/main/java/fu/se/smms/repository/RoomBookingRepository.java`
- `Backend/src/main/java/fu/se/smms/entity/Invoice.java`
- `Backend/src/main/java/fu/se/smms/entity/RoomBooking.java`
- `Backend/src/main/java/fu/se/smms/entity/User.java`
- `Backend/src/main/java/fu/se/smms/entity/MedicalProfile.java`
- `Backend/src/main/java/fu/se/smms/dto/InvoiceDTO.java`
- `Backend/src/main/java/fu/se/smms/dto/VNPayPaymentDTO.java`
- `Backend/src/main/java/fu/se/smms/config/VNPayProperties.java`
- `Backend/src/main/java/fu/se/smms/config/SecurityConfig.java`
- `Backend/src/main/java/fu/se/smms/exception/BusinessException.java`
- `Backend/src/main/java/fu/se/smms/exception/ApiError.java`
- `Backend/src/main/java/fu/se/smms/exception/GlobalExceptionHandler.java`
- `Backend/src/main/resources/application.properties`
- `Backend/src/test/java/fu/se/smms/service/impl/InvoiceServiceImplTest.java`

### Database

- `SQL_DB_RESORT_SPA/resort_spa_db.sql`

### Tai Lieu

- `Backend/docs/PAYMENT_EDS.md`
- `Backend/docs/PAYMENT_TDD.md`
- `Backend/docs/WORK_SUMMARY.md`

## 3. Luong Thanh Toan Da Hoan Thien

### 3.1 Tao Hoa Don

Endpoint:

```http
POST /api/invoices/booking/{bookingId}
```

Backend se:

1. Tim booking theo `bookingId`.
2. Neu booking da co invoice thi lay invoice cu.
3. Neu invoice chua `PAID` thi tinh lai tien.
4. Luu cac cot tien vao invoice:
   - `room_subtotal`
   - `spa_subtotal`
   - `food_subtotal`
   - `tax_and_fees`
   - `final_amount`
   - `deposit_amount`
   - `amount_due`

Cong thuc dang dung:

```text
taxable_base = room_subtotal + spa_subtotal + food_subtotal
tax_and_fees = taxable_base * 10%
final_amount = taxable_base + tax_and_fees
deposit_amount = room_booking.total_deposit
amount_due = final_amount - deposit_amount
```

Neu `deposit_amount > final_amount`, backend nem loi conflict de tranh hoa don am.

### 3.2 Tinh Tien Phong

Da sua logic tinh tien phong trong `InvoiceRepository.sumRoomSubtotal()`.

Neu booking co package:

```text
room_subtotal = retreat_package.base_price
```

Neu booking khong co package:

```text
room_subtotal = SUM(room_booking_detail.price_at_booking * so_dem)
so_dem = DATEDIFF(day, check_in_date, check_out_date)
```

Ly do sua: booking package khong duoc chi tinh theo gia phong vat ly trong `room_booking_detail`, vi package moi la gia chinh cua goi nghi duong.

### 3.3 Tinh Tien Spa

Chi tinh cac spa booking:

- `is_package_included = 0`
- `status IN ('CONFIRMED', 'COMPLETED')`

Spa da nam trong package se khong bi tinh tien lai.

### 3.4 Tinh Tien Food

Chi tinh cac food order detail:

- `is_package_included = 0`
- order status `IN ('READY', 'DELIVERED')`

Food da nam trong package se khong bi tinh tien lai.

### 3.5 Thanh Toan Tien Mat

Endpoint:

```http
POST /api/invoices/{invoiceId}/cash
```

Backend se:

- Khong cho thanh toan invoice `CANCELLED`.
- Set `status = PAID`.
- Set `payment_time = now`.
- Khong set `vnpay_tran_id` vi day la tien mat.

## 4. VNPay Sandbox Da Tich Hop

### 4.1 Cau Hinh

Da dua cau hinh VNPay sandbox vao `application.properties` theo prefix:

```properties
payment.vnpay.*
```

Cac thong tin da cau hinh:

- Pay URL sandbox.
- Return URL local.
- Terminal code sandbox.
- Hash secret sandbox.
- Version, command, currency, locale, order type.
- Thoi gian het han URL thanh toan: 15 phut.

Ghi chu bao mat: file cau hinh hien dang co secret sandbox de test. Khi dua len production hoac push repo public thi can chuyen secret sang environment variable, khong commit secret that.

### 4.2 Tao URL Thanh Toan VNPay

Endpoint:

```http
POST /api/invoices/{invoiceId}/vnpay
```

Backend se:

1. Lay invoice theo `invoiceId`.
2. Chan invoice da `PAID`.
3. Chan invoice `CANCELLED`.
4. Lay so tien can thanh toan:

```text
payable_amount = amount_due neu amount_due > 0
payable_amount = final_amount neu amount_due bi thieu hoac bang 0
```

5. Doi sang don vi VNPay:

```text
vnp_Amount = payable_amount * 100
```

6. Tao query theo format VNPay.
7. Ky HMAC SHA512 bang `payment.vnpay.hash-secret`.
8. Tra ve `paymentUrl` de frontend redirect user sang VNPay.

Quyet dinh quan trong: VNPay chi thu `amount_due`, khong thu lai `final_amount`, vi `final_amount` la tong hoa don truoc khi tru tien coc.

### 4.3 VNPay Return

Endpoint:

```http
GET /api/invoices/vnpay-return
```

Dung cho browser quay ve tu VNPay.

Backend se:

1. Nhan cac tham so `vnp_*`.
2. Kiem tra `vnp_SecureHash`.
3. Kiem tra `vnp_Amount` co khop invoice khong.
4. Neu `vnp_ResponseCode = 00` va `vnp_TransactionStatus = 00` thi set invoice `PAID`.
5. Luu `vnpay_tran_id`.
6. Luu `payment_time`.

### 4.4 VNPay Callback Cu

Endpoint:

```http
GET /api/invoices/vnpay-callback
```

Endpoint nay duoc giu lai de tuong thich voi code/demo cu. Logic xu ly tuong tu `vnpay-return`.

### 4.5 VNPay IPN

Endpoint:

```http
GET /api/invoices/vnpay-ipn
```

Dung cho server-to-server IPN cua VNPay.

Backend tra ve format dung cho VNPay:

```json
{
  "RspCode": "00",
  "Message": "Confirm Success"
}
```

Mot so ma phan hoi da xu ly:

- `00`: Confirm Success.
- `01`: Order not found.
- `02`: Order already confirmed.
- `04`: Invalid amount.
- `97`: Invalid signature.
- `99`: Unknown or business error.

## 5. Database Da Kiem Tra Va Sua

File chinh:

```text
SQL_DB_RESORT_SPA/resort_spa_db.sql
```

### 5.1 Script Tu Tao Database

Da sua phan dau script de tu tao DB neu chua co:

```sql
IF DB_ID('ResortSpaDB') IS NULL
BEGIN
    CREATE DATABASE ResortSpaDB;
END
GO
USE ResortSpaDB;
GO
```

Nhu vay khi chay script bang `sqlcmd` hoac SSMS, DB `ResortSpaDB` se duoc tao neu may chua co.

### 5.2 Bang Invoice

Da bo sung cac cot:

```sql
deposit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00
amount_due DECIMAL(15,2) NOT NULL DEFAULT 0.00
```

Da bo sung cac constraint:

```sql
CK_invoice_Deposit CHECK (deposit_amount >= 0)
CK_invoice_Due CHECK (amount_due >= 0)
CK_invoice_Deposit_Not_Over_Final CHECK (deposit_amount <= final_amount)
CK_invoice_Due_Equals_Final_Minus_Deposit CHECK (amount_due = final_amount - deposit_amount)
UQ_invoice_room_booking UNIQUE (room_booking_id)
```

Y nghia:

- Khong cho tien coc am.
- Khong cho tien can thanh toan am.
- Khong cho tien coc lon hon tong hoa don.
- Khong cho `amount_due` lech voi `final_amount - deposit_amount`.
- Khong cho 1 booking sinh nhieu invoice.

### 5.3 Seed Invoice Da Sua

Booking 1 da duoc sua thanh:

```text
room_subtotal   = 12,500,000
spa_subtotal    = 0
food_subtotal   = 320,000
tax_and_fees    = 1,282,000
final_amount    = 14,102,000
deposit_amount  = 3,750,000
amount_due      = 10,352,000
status          = UNPAID
```

Day la diem quan trong vi truoc do co nguy co thu lai toan bo `final_amount`, trong khi khach da coc 30%.

### 5.4 Query Kiem Tra Tinh Tien

Da them section query verify vao script DB de doi chieu tien booking:

- Booking 1 expected due: `10,352,000`.
- Booking 2 expected due: `9,306,500`.

Query nay tinh lai:

- room subtotal
- spa subtotal
- food subtotal
- tax
- final amount
- deposit
- amount due

Muc dich la de nhin ngay neu seed data hoac cong thuc tinh tien bi lech.

### 5.5 Cart Item

Da sua `cart_item` tu dang generic:

```text
item_type + item_id
```

sang dang co foreign key that:

```text
room_type_id
spa_id
food_id
```

Va co constraint chi cho phep moi row dai dien dung 1 loai item:

```sql
CK_cart_item_one_item
```

Ly do sua: cach cu de `item_id` khong co foreign key nen DB khong bat duoc item sai hoac item khong ton tai.

### 5.6 User

Da dieu chinh:

- `id_passport_encrypted` cho phep `NULL` de phu hop user moi dang ky chua nhap passport.
- Them check co ban cho email.
- Them check co ban cho phone.
- Them seed `guest3` co passport null de test truong hop optional.

### 5.7 Index

Da bo sung them index cho cac foreign key va query hay dung:

- room booking
- room booking detail
- spa booking
- food order
- invoice
- cart item
- package limit
- feedback/blog related fields

Muc dich la giup query invoice va cac bang lien quan chay on dinh hon khi du lieu tang.

## 6. Tai Lieu Da Tao

### 6.1 EDS

File:

```text
Backend/docs/PAYMENT_EDS.md
```

Noi dung chinh:

- Muc tieu thiet ke.
- Business rules cua thanh toan.
- Constraint va assumption.
- Luong tao invoice.
- Luong VNPay return/IPN.
- API contract.
- Data model lien quan invoice/payment.
- Security decision.
- Deployment/configuration notes.

### 6.2 TDD

File:

```text
Backend/docs/PAYMENT_TDD.md
```

Noi dung chinh:

- Test strategy.
- Unit test cho invoice calculation.
- Test VNPay URL signing.
- Test callback signature.
- Test invalid amount.
- Test cash payment.
- Huong dan test bang Postman/cURL.
- Huong dan reset invoice de test lai VNPay.

## 7. Test Da Chay

### 7.1 Kiem Tra Diff Whitespace

Lenh da chay:

```powershell
git diff --check -- .\SQL_DB_RESORT_SPA .\Backend
```

Ket qua:

- Pass.
- Khong con trailing whitespace loi.
- Chi con warning CRLF cua Git tren Windows, khong phai loi code.

### 7.2 Maven Test

Maven khong co san trong PATH, nen da dung Maven cua IntelliJ:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-24'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
& 'C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\plugins\maven\lib\maven3\bin\mvn.cmd' test
```

Ket qua cuoi:

- Exit code: `0`.
- Test pass.

Co warning:

- `Access is denied.`
- Deprecated `sun.misc.Unsafe`.
- Mockito dynamic agent warning.

Cac warning nay khong lam fail test trong lan chay cuoi.

### 7.3 Test DB Thuc Te

Chua confirm duoc full E2E voi SQL Server local vi moi truong local dang bi loi connect/login:

- SQL Server tu choi user `sa`.
- Co them van de client encryption/certificate khi thu bang `sqlcmd`.

Vi vay, ket luan dung la:

- Unit test backend pass.
- SQL script da duoc sua va kiem tra logic bang doc script/diff.
- Chua the xac nhan script da chay thanh cong tren SQL Server local cua may nay cho den khi credential SQL Server dung.

## 8. Cach Chay Lai DB

Neu dung `sqlcmd`, co the chay:

```powershell
sqlcmd -S localhost -U sa -P "<password>" -C -i SQL_DB_RESORT_SPA\resort_spa_db.sql
```

Ghi chu:

- Thay `<password>` bang password SQL Server thuc te.
- `-C` dung de trust certificate trong moi truong local neu gap loi SSL.
- Script co drop table va seed lai data, nen se reset DB hien co.

Neu dung SSMS:

1. Mo file `SQL_DB_RESORT_SPA/resort_spa_db.sql`.
2. Connect vao SQL Server local.
3. Chay toan bo script.
4. Kiem tra DB `ResortSpaDB`.
5. Chay query verify o cuoi section invoice de doi chieu tien.

## 9. Cach Chay Backend Trong IntelliJ

1. Mo folder `Backend` bang IntelliJ.
2. Dam bao JDK dang dung la Java 21 hoac cao hon. May hien tai co JDK 24.
3. Kiem tra `Backend/src/main/resources/application.properties`.
4. Sua SQL Server username/password cho dung may local.
5. Chay class:

```text
fu.se.smms.SmmsApplication
```

Neu DB credential dung, backend se boot tren:

```text
http://localhost:8080
```

## 10. Luong Test VNPay De Nhin Thay Thanh Toan

Sau khi DB va backend chay:

1. Tao invoice:

```http
POST http://localhost:8080/api/invoices/booking/1
```

2. Tao URL VNPay:

```http
POST http://localhost:8080/api/invoices/1/vnpay
```

3. Copy `paymentUrl` tra ve va mo tren browser.

4. Dung the test VNPay sandbox:

```text
Ngan hang: NCB
So the: 9704198526191432198
Ten chu the: NGUYEN VAN A
Ngay phat hanh: 07/15
OTP: 123456
```

5. Sau khi thanh toan thanh cong, VNPay redirect ve:

```text
http://localhost:8080/api/invoices/vnpay-return
```

6. Kiem tra invoice:

```http
GET http://localhost:8080/api/invoices/1
```

Expected:

```text
status = PAID
vnpayTranId co gia tri
paymentTime co gia tri
```

## 11. Diem Can Luu Y Tiep Theo

### 11.1 Secret VNPay

Thong tin VNPay hien dang la sandbox. Khi nop project noi bo thi co the de trong `application.properties` de thay co test. Neu dua len repo public hoac production thi nen chuyen sang environment variable.

### 11.2 Return URL

Return URL hien dang la:

```text
http://localhost:8080/api/invoices/vnpay-return
```

Neu test tren may khac, deploy server, hoac dung ngrok, can doi URL nay theo domain public de VNPay redirect dung.

### 11.3 DB Local La Dieu Kien Bat Buoc

Backend khong the chay E2E neu:

- SQL Server chua bat.
- DB `ResortSpaDB` chua tao.
- User/password trong `application.properties` sai.
- SQL Server khong cho SQL Authentication.

### 11.4 Target Folder

`Backend/target` la output build cua Maven. No khong phai source chinh. Khi copy sang IntelliJ, can mo folder `Backend`, khong mo rieng `target`.

## 12. Ket Luan

Trang thai hien tai:

- Backend thanh toan da co logic that, khong con stub `return null`.
- VNPay sandbox da duoc cau hinh va co endpoint return/IPN.
- Invoice da tach ro `final_amount`, `deposit_amount`, `amount_due`.
- DB da co constraint de bat loi tien lech va tranh duplicate invoice.
- Test backend da pass bang Maven.
- EDS/TDD da duoc tao trong `Backend/docs`.

Phan con phu thuoc moi truong:

- Can SQL Server local login duoc de chay script va test E2E voi DB that.
- Can backend chay public/local dung URL de VNPay redirect ve thanh cong.
