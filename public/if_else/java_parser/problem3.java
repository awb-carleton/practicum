public class A {
    public static void ifElseMystery3 (int x, int y, int z) {

        if (x > y) {
            x = 9 + z;
        } else if (x > z) {
            y = x + z + 1;
        } else if (y > z) {
            z = z - 7;
            y = x + 3;
        }

        if (y > x) {
            z = 3;
        }

        System.out.println(x + " " + y + " " + z);
    }
}