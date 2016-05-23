package com.khs.microservice.whirlpool.common;

public class Message {
   private String type;
   private String id;

   public String getType() { return type; }

   public void setType(String type) { this.type = type; }

   public String getId() { return id; }

   public void setId(String id) { this.id = id; }

   @Override
   public boolean equals(Object o) {
      if (this == o) { return true; }
      if (o == null || getClass() != o.getClass()) { return false; }

      Message that = (Message) o;

      if (type != null ? !type.equals(that.type) : that.type != null) { return false; }
      if (id != null ? !id.equals(that.id) : that.id != null) { return false; }

      return true;
   }

   @Override
   public int hashCode() {
      int result = type != null ? type.hashCode() : 0;
      result = 31 * result + (this.id != null ? this.id.hashCode() : 0);
      return result;
   }

   @Override
   public String toString() {
      return "Message{" +
              "type='"  + type + "'" +
              ", id='"  + id   + "'" +
             "}";
   }
}
