package fu.se.smms.controller;

import fu.se.smms.entity.Complaint;
import fu.se.smms.entity.ComplaintMessage;
import fu.se.smms.entity.User;
import fu.se.smms.repository.ComplaintRepository;
import fu.se.smms.repository.ComplaintMessageRepository;
import fu.se.smms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintMessageRepository complaintMessageRepository;

    public ComplaintController(ComplaintRepository complaintRepository, UserRepository userRepository, ComplaintMessageRepository complaintMessageRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.complaintMessageRepository = complaintMessageRepository;
    }


    @PostMapping("/submit")
    public ResponseEntity<Complaint> submitComplaint(@RequestBody Map<String, Object> request) {
        String guestName = (String) request.get("guestName");
        String roomNumber = (String) request.get("roomNumber");
        String content = (String) request.get("content");
        Integer userId = (Integer) request.get("userId");

        if (guestName == null || guestName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (roomNumber == null || roomNumber.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Complaint complaint = new Complaint();
        complaint.setGuestName(guestName);
        complaint.setRoomNumber(roomNumber);
        complaint.setContent(content);
        complaint.setStatus("Open");

        if (userId != null) {
            userRepository.findById(userId).ifPresent(complaint::setUser);
        }

        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> getComplaintsByUser(@PathVariable Integer userId) {
        List<Complaint> complaints = complaintRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Complaint> resolveComplaint(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        String feedback = request.get("feedback");
        return complaintRepository.findById(id)
                .map(complaint -> {
                    complaint.setStatus("Resolved");
                    complaint.setFeedback(feedback != null ? feedback : "Đã xử lý xong");
                    Complaint saved = complaintRepository.save(complaint);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ComplaintMessage>> getComplaintMessages(@PathVariable Integer id) {
        if (!complaintRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<ComplaintMessage> messages = complaintMessageRepository.findByComplaint_IdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> sendComplaintMessage(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }

        String content = (String) request.get("content");
        String senderName = (String) request.get("senderName");
        String senderRole = (String) request.get("senderRole");
        Number senderIdNum = (Number) request.get("senderId");
        
        if (content == null || content.isBlank() || senderName == null || senderRole == null) {
            return ResponseEntity.badRequest().body("Nội dung tin nhắn và thông tin người gửi không hợp lệ");
        }
        
        ComplaintMessage msg = new ComplaintMessage();
        msg.setComplaint(complaint);
        msg.setContent(content);
        msg.setSenderName(senderName);
        msg.setSenderRole(senderRole);
        
        if (senderIdNum != null) {
            userRepository.findById(senderIdNum.intValue()).ifPresent(msg::setSender);
        }
        
        ComplaintMessage saved = complaintMessageRepository.save(msg);
        
        // Also, if the message is from staff/admin and status is Open, we can automatically set the status to "In Progress"
        if (("Staff".equalsIgnoreCase(senderRole) || "Admin".equalsIgnoreCase(senderRole)) && "Open".equalsIgnoreCase(complaint.getStatus())) {
            complaint.setStatus("In Progress");
            complaintRepository.save(complaint);
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignComplaintStaff(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }
        
        Number staffIdNum = (Number) request.get("staffId");
        String staffName = (String) request.get("staffName");
        String staffPhone = (String) request.get("staffPhone");
        
        if (staffIdNum != null) {
            userRepository.findById(staffIdNum.intValue()).ifPresent(user -> {
                complaint.setAssignedStaff(user);
                complaint.setAssignedStaffName(user.getFullName());
                complaint.setAssignedStaffPhone(user.getPhone());
            });
        } else {
            complaint.setAssignedStaff(null);
            if (staffName != null) {
                complaint.setAssignedStaffName(staffName);
            }
            if (staffPhone != null) {
                complaint.setAssignedStaffPhone(staffPhone);
            }
        }
        
        // Set status to In Progress if currently Open
        if ("Open".equalsIgnoreCase(complaint.getStatus())) {
            complaint.setStatus("In Progress");
        }
        
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(saved);
    }
}

