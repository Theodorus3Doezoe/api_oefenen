import express, { response } from "express";
import { query, validationResult, body } from "express-validator"
// import { request } from "http";

const app = express();

app.use(express.json()); //passeert json uit http verzoeken en maakt dit beschikbaar via de request.body

const resolveIndexByUserId = (request, response, next) => {
    const {params: {id},} = request;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return response.sendStatus(400);
    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId) //De findIndex() functie ittereert over de mockUsers array en checkt of user.id gelijk is aan de parsedId. user is een variabel voor het ittereren in de functie.
    if (findUserIndex === -1) return response.sendStatus(404)
    request.findUserIndex = findUserIndex
    next()
}


const PORT = process.env.PORT || 3000;

const mockUsers = [
    {id: 1, username: 'sven'},
    {id: 2, username: 'lis'}
]

app.get('/api/users', 
query('filter')
    .isString()
    .notEmpty().withMessage('Must not be empty!')
    .isLength({ min: 3, max: 10}).withMessage('Must be atleast 3 - 10 characters.'), 
(request, response) => {
    const result = validationResult(request)
    console.log(result)
    const { query: {filter, value }, } = request;
    if (filter && value) return response.send(mockUsers.filter((user) => user[filter].includes(value)));
    return response.send(mockUsers)
})

app.get('/api/users/:id', resolveIndexByUserId ,(request, response) => {
    const {findUserIndex} = request;
    const findUser = mockUsers[findUserIndex];
    if (!findUser) return response.sendStatus(404);
    response.send(findUser)
})

app.post('/api/users', 
    body('username')
    .notEmpty().withMessage("Username cannot be empty!")
    .isLength({min: 5, max: 32}).withMessage("Username must be atleast 5 characters with a max of 32.")
    .isString().withMessage("Username must be a string!"),
    (request, response) => {
        const result = validationResult(request)
        console.log(result)
        const { body } = request//Hier wordt de request gedeconstruct en de body in het object request toegewezen aan de variabel body
        const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...body } //Voor de id van het newUser object wordt eerst de id van de laatste gebruiker opgehaald vervolgens wordt hier +1 aan toegevoegd voor de newUser ...body spreidt de rest van de waardes uit de body uit over het newUser object.
        mockUsers.push(newUser) //Hiermee voeg je de nieuw user toe aan de mockUsers array. Nu is er geen database dus doe ik het even zo.
        return response.status(201).send(newUser) //returned een responsecode van 201 voor succesvol response en de newUser in een bericht
})

app.put('/api/users/:id', resolveIndexByUserId ,(request, response) => {
    const {body, findUserIndex} = request;
    mockUsers[findUserIndex] = { id : mockUsers[findUserIndex].id, ...body }
    return response.sendStatus(200)
});

app.patch('/api/users/:id', resolveIndexByUserId ,(request, response) => {
    const { body, findUserIndex } = request;
    mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body } //Hier word de geselecteerde gebruiker zijn data verzameld en uitgepakt. vervolgens wordt de data uit de request body ook uitgepakt en wat er dan als nieuwe waarde in de body staat overschrijft dan de oude uitgepakte data. Dit is handig dus als je een data niet invoerdt blijft deze zoals eerst.
    return response.sendStatus(200);
})

app.delete("/api/users/:id", resolveIndexByUserId ,(request, response) => {
    const { findUserIndex } = request
    mockUsers.splice(findUserIndex, 1);
    return response.sendStatus(200);
})

app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
})

