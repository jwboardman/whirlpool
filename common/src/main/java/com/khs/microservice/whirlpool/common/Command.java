package com.khs.microservice.whirlpool.common;

public class Command {
   // type is for JSON
   private String type;
   private String id;
   private String command;
   private String subscription;

   public String getType() { return type; }

   public void setType(String type) { this.type = type; }

   public String getId() { return id; }

   public void setId(String id) { this.id = id; }

   public String getCommand() {
      return command;
   }

   public void setCommand(String command) {
      this.command = command;
   }

   public String getSubscription() {
      return subscription;
   }

   public void setSubscription(String subscription) { this.subscription = subscription; }

   @Override
   public boolean equals(Object o) {
      if (this == o) { return true; }
      if (o == null || getClass() != o.getClass()) { return false; }

      Command that = (Command) o;

      if (id != null ? !id.equals(that.id) : that.id != null) { return false; }
      if (command != null ? !command.equals(that.command) : that.command != null) { return false; }
      if (subscription != null ? !subscription.equals(that.subscription) : that.subscription != null) { return false; }

      return true;
   }

   @Override
   public int hashCode() {
      int result = this.id != null ? this.id.hashCode() : 0;
      result = 31 * result + (command != null ? command.hashCode() : 0);
      result = 31 * result + (subscription != null ? subscription.hashCode() : 0);
      return result;
   }

   @Override
   public String toString() {
      return type + "{"          +
              "id='"             + id           + "'" +
              ", command='"      + command      + "'" +
              ", subscription='" + subscription + "'" +
             "}";
   }
}
