import java.util.Map;
public class TempMapOfEntriesTest {
    private static final Map<String,String> TOPIC_DESCRIPTIONS = Map.ofEntries(
        Map.entry("dsa", "Data Structures"),
        Map.entry("system-design", "System Design")
    );
    public static void main(String[] args) {
        System.out.println(TOPIC_DESCRIPTIONS.get("dsa"));
    }
}
