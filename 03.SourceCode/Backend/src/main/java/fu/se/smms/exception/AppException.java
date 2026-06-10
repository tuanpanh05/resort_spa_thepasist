package fu.se.smms.exception;

public class AppException extends RuntimeException {
    private final int status;

    public AppException(String message) {
        super(message);
        this.status = 400; // Bad request by default
    }

    public AppException(String message, int status) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
