package fu.se.smms.controller;

import fu.se.smms.entity.Complaint;
import fu.se.smms.entity.User;
import fu.se.smms.repository.ComplaintRepository;
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

    public ComplaintController(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
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
}
