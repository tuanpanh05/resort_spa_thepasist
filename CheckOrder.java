import java.sql.*;
public class CheckOrder {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/smms_db", "root", "root");
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM food_order_detail WHERE order_id = (SELECT order_id FROM food_order WHERE order_id = 11)");
        ResultSet rs = stmt.executeQuery();
        while(rs.next()) {
            System.out.println("FoodId: " + rs.getInt("food_id") + " - Qty: " + rs.getInt("quantity") + " - Note: " + rs.getString("special_note"));
        }
        conn.close();
    }
}
