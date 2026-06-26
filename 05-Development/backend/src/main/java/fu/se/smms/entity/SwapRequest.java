package fu.se.smms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "swap_requests")
public class SwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sender", nullable = false, length = 100)
    private String sender;

    @Column(name = "shift", nullable = false, length = 100)
    private String shift;

    @Column(name = "date", nullable = false, length = 50)
    private String date;

    @Column(name = "receiver", nullable = false, length = 100)
    private String receiver;

    @Column(name = "reason", nullable = false, length = 255)
    private String reason;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    public SwapRequest() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getReceiver() { return receiver; }
    public void setReceiver(String receiver) { this.receiver = receiver; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
