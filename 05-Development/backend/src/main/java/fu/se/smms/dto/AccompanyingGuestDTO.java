package fu.se.smms.dto;

/**
 * DTO for carrying accompanying guest information during check-in.
 */
public class AccompanyingGuestDTO {

    private String fullName;
    private String identityDocument;
    private String relationship;
    private Boolean isChild;

    public AccompanyingGuestDTO() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getIdentityDocument() { return identityDocument; }
    public void setIdentityDocument(String identityDocument) { this.identityDocument = identityDocument; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public Boolean getIsChild() { return isChild; }
    public void setIsChild(Boolean isChild) { this.isChild = isChild; }
}
