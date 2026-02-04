/**
 * Assignments Data - Contains all Karel programming assignments
 * Each assignment has:
 * - id: unique identifier
 * - title: Georgian title
 * - description: Georgian description of the task
 * - world: World file content in Karel format
 * - expectedWorld: Expected final world state
 * - starterCode: Initial code template
 * - hints: Array of hints
 */

export const assignments = [
    {
        id: 'collect_newspaper_karel',
        number: 1,
        title: 'გაზეთის შეგროვება',
        description: `კარელი ცხოვრობს სახლში, რომელსაც აქვს კარი. სახლის გარეთ, კართან, დევს გაზეთი (ბიპერი).
    
თქვენი ამოცანაა დაწეროთ პროგრამა, რომელიც კარელს:
1. გაიყვანს სახლის კარამდე
2. გაატანს კარს და აიღებინებს გაზეთს (ბიპერს)
3. დააბრუნებს საწყის პოზიციაზე სახლის შიგნით

კარელი იწყებს სახლის ზედა მარცხენა კუთხეში და იყურება აღმოსავლეთით.`,
        world: `Dimension: (7, 5)
Wall: (3, 2); west
Wall: (3, 2); south
Wall: (3, 3); west
Wall: (3, 4); west
Wall: (3, 5); south
Wall: (4, 2); south
Wall: (4, 5); south
Wall: (5, 2); south
Wall: (5, 5); south
Wall: (6, 2); west
Wall: (6, 4); west
Beeper: (6, 3); 1
Karel: (3, 4); east
Speed: 0.00`,
        expectedWorld: `Dimension: (7, 5)
Wall: (4, 2); south
Wall: (3, 4); west
Wall: (4, 5); south
Wall: (5, 2); south
Wall: (3, 5); south
Wall: (3, 3); west
Wall: (3, 2); south
Wall: (6, 4); west
Wall: (3, 2); west
Wall: (6, 2); west
Wall: (5, 5); south
Karel: (3, 4); east
BeeperBag: 1`,
        starterCode: `def main():
    """
    კარელმა უნდა წავიდეს კართან,
    აიღოს გაზეთი და დაბრუნდეს უკან.
    """
    # დაწერეთ თქვენი კოდი აქ
    `,
        hints: [
            'გამოიყენეთ move() წინ გადასაადგილებლად',
            'გამოიყენეთ turn_left() მარცხნივ მოსაბრუნებლად',
            'სამჯერ turn_left() = ერთხელ მარჯვნივ მობრუნება',
            'გამოიყენეთ pick_beeper() ბიპერის ასაღებად',
        ],
        completed: false,
    },
    {
        id: 'checkerboard_karel',
        number: 2,
        title: 'ჭადრაკის დაფა',
        description: `კარელმა უნდა შექმნას ჭადრაკის დაფის მსგავსი ნიმუში ბიპერებით.

თქვენი ამოცანაა დაწეროთ პროგრამა, რომელიც:
1. მთელ სამყაროს დაფარავს ჭადრაკის ნიმუშით
2. იმუშავებს ნებისმიერი ზომის სამყაროზე

ეს დავალება მოითხოვს ციკლების გამოყენებას!`,
        world: `Dimension: (8, 8)
Karel: (1, 1); east
BeeperBag: infinity`,
        expectedWorld: `Dimension: (8, 8)
Karel: (1, 8); east
BeeperBag: infinity`,
        starterCode: `def main():
    """
    შექმენით ჭადრაკის დაფის ნიმუში.
    """
    # დაწერეთ თქვენი კოდი აქ
    `,
        hints: [
            'გამოიყენეთ while ციკლები',
            'გამოიყენეთ front_is_clear() შესამოწმებლად',
            'put_beeper() დებს ბიპერს',
        ],
        completed: false,
    },
    {
        id: 'stone_mason_karel',
        number: 3,
        title: 'ქვისმთლელი კარელი',
        description: `კარელი არის ქვისმთლელი, რომელმაც უნდა აღადგინოს დაზიანებული სვეტები.

თქვენი ამოცანაა:
1. იპოვოთ ყველა სვეტი (ყოველ მე-4 პოზიციაზე)
2. ავიდეთ სვეტზე და შეავსოთ დაკარგული ბიპერები
3. ჩამოხვიდეთ და გადახვიდეთ შემდეგ სვეტზე`,
        world: `Dimension: (13, 8)
Karel: (1, 1); east
BeeperBag: infinity
Beeper: (1, 1); 1
Beeper: (1, 3); 1
Beeper: (1, 5); 1
Beeper: (5, 1); 1
Beeper: (5, 2); 1
Beeper: (9, 1); 1
Beeper: (9, 4); 1
Beeper: (13, 1); 1
Beeper: (13, 2); 1
Beeper: (13, 3); 1`,
        expectedWorld: `Dimension: (13, 8)
Karel: (13, 1); east
BeeperBag: infinity`,
        starterCode: `def main():
    """
    აღადგინეთ ყველა სვეტი ბიპერებით.
    """
    # დაწერეთ თქვენი კოდი აქ
    `,
        hints: [
            'სვეტები არის 1, 5, 9, 13 პოზიციებზე',
            'გამოიყენეთ beepers_present() შესამოწმებლად',
            'ჯერ ავდივართ, მერე ჩამოვდივართ',
        ],
        completed: false,
    },
];

export default assignments;
