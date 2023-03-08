<a href="https://edworld.gq"><h1><b>edWorld</b></h1></a>
<br>
<a href="https://edworld.gq">
<img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
</a>

## **About**

edWorld is a web app is designed to assist educational institutions in managing their students and teachers. It includes a range of features such as admission management, batch creation with assigned teachers and subjects, student attendance and performance tracking, and fee payment management. On top of node js express and mongodb the platform has utilised various technologies including Bootstrap, Razorpay, Nodemailer, and Cloudinary to improve its functionality and user experience. It has been hosted on AWS with EC2 and Route 53 to ensure seamless access and scalability.

![image](https://user-images.githubusercontent.com/64640025/211061221-cdd72a97-87b0-4ae9-a66e-310be5d07250.png)


## **Getting Started**

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### _Prerequisites_

Requirements you need to run the software and how to get them.

1. [Git](https://git-scm.com/downloads)
2. [NodeJs](https://nodejs.org/en/download)
3. [Mongodb](https://www.mongodb.com/docs/manual/tutorial/getting-started/)
4. [Oauth tokens for your email to setup nodemailer](https://www.freecodecamp.org/news/use-nodemailer-to-send-emails-from-your-node-js-server/)
5. [Razorpay account](https://dashboard.razorpay.com/signup)
6. [Cloudinary account](https://cloudinary.com/users/register_free)

### _Installation_

A step by step series of examples that tell you how to get a development env running.

Clone this repository to your local system.

```
git clone https://github.com/shamilkotta/edWorld.git
```

Then go to this project directory by running command `cd edWorld`

Firstly install the required packages

```
npm install
```

Then you've to setup env file. <br>
Create a `.env` file and paste the keys inthe [`sample.env`](/sample.env) and add your values.

Then start the dev server by executing

```
npm run dev
```

Now you can navigate to browser in url http://localhost:5000 (by default) to see the output.

### _Coding style tests_

Check if any files need to be formatted, if the check fails that means some files needed to be formatted or have to do some fixes.

eslint

```
npm run lint
```

prettier

```
npm run pretty
```

To format all required code files

```
npm run style
```

## **Contributing**

Read contributing instructions and guidlines from [here](/CONTRIBUTING.md).

## **Built Using**

- [NodeJs](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Handlebars](https://handlebarsjs.com/)
- [Bootstrap](https://getbootstrap.com/docs/5.2/getting-started/introduction/)

## **Author**

- [@shamilkotta](https://github.com/shamilkotta)

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!
