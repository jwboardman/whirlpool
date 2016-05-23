package com.khs.microservice.whirlpool.common;

import java.text.SimpleDateFormat;
import java.util.Calendar;

public class CommandResponse {
   // type is for JSON
   private String type;
   private String id;
   private String command;
   private String subscription;
   private String result;
   private String timestamp;
   private String errorMessage;

   public String getType() { return type; }

   public void setType(String type) { this.type = type; }

   public String getId() { return id; }

   public void setId(String id) { this.id = id; }

   public String getCommand() { return command; }

   public void setCommand(String command) { this.command = command; }

   public String getSubscription() {
      return subscription;
   }

   public void setSubscription(String subscription) { this.subscription = subscription; }

   public String getResult() { return result; }

   public void setResult(String command) {
      this.result = command;
   }

   public String getTimestamp() { return timestamp; }

   public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

   public String getErrorMessage() { return errorMessage; }

   public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

   public CommandResponse() {
      Calendar cal = Calendar.getInstance();
      cal.add(Calendar.DATE, 1);
      SimpleDateFormat format1 = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss a");
      String formatted = format1.format(cal.getTime());
      setTimestamp(formatted);
   }

   @Override
   public boolean equals(Object o) {
      if (this == o) { return true; }
      if (o == null || getClass() != o.getClass()) { return false; }

      CommandResponse that = (CommandResponse) o;

      if (id != null ? !id.equals(that.id) : that.id != null) { return false; }
      if (result != null ? !result.equals(that.result) : that.result != null) { return false; }
      if (command != null ? !command.equals(that.command) : that.command != null) { return false; }
      if (subscription != null ? !subscription.equals(that.subscription) : that.subscription != null) { return false; }
      if (timestamp != null ? !timestamp.equals(that.timestamp) : that.timestamp != null) { return false; }
      if (errorMessage != null ? !errorMessage.equals(that.errorMessage) : that.errorMessage != null) { return false; }

      return true;
   }

   @Override
   public int hashCode() {
      int result = this.id != null ? this.id.hashCode() : 0;
      result = 31 * result + (this.result != null ? this.result.hashCode() : 0);
      result = 31 * result + (command != null ? command.hashCode() : 0);
      result = 31 * result + (subscription != null ? subscription.hashCode() : 0);
      result = 31 * result + (timestamp != null ? timestamp.hashCode() : 0);
      result = 31 * result + (errorMessage != null ? errorMessage.hashCode() : 0);
      return result;
   }

   @Override
   public String toString() {
      return type + "{"   +
              "id='"             + id           + "'" +
              ", result='"       + result       + "'" +
              ", command='"      + command      + "'" +
              ", subscription='" + subscription + "'" +
              ", timestamp='"    + timestamp    + "'" +
              ", errorMessage='" + errorMessage + "'" +
              "}";
   }
}
