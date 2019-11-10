export var option0 =
{
    "type": true,
    "title": "",
    "totalQuestion": 0,
    "duration": 15,
    selectedItems:[],
    "dev3": 0,
    "dev2": 0,
    "dev1": 0,
}
export var option1 =
{
    "type": true,
    "title": "test developer",
    "testOwnerId" : Number(sessionStorage.getItem("AccountId")),
    "totalQuestion": 30,
    "duration": 20,
    selectedItems:
        [
            { "weightPoint": 20 },
            { "weightPoint": 20 },
            { "weightPoint": 60 },
        ],
    "dev3": 70,
    "dev2": 60,
    "dev1": 50,
}
export var option2 =
{
    "type": true,
    "title": "test manager",
    "testOwnerId" : Number(sessionStorage.getItem("AccountId")),
    "totalQuestion": 40,
    "duration": 25,
    selectedItems:
        [
            { "weightPoint": 30 },
            { "weightPoint": 30 },
            { "weightPoint": 20 },
            { "weightPoint": 20 },
        ],
    "dev3": 80,
    "dev2": 60,
    "dev1": 50,
}
export var Point: number[][] =[ [88,64,40], [90,72,53], [97,100,87], [93,70,50]];