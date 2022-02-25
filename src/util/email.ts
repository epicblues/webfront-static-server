import nodemailer from "nodemailer";

// 식품 영양 성분 DB가 업데이트 되었을 경우 내 이메일로 상황을 보낸다.
export async function sendDbOutdatedEmail() {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // 465 포트일 때만 true
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PW,
    },
  });

  // 설정한 transporter 인스턴스를 통해 메일을 보낸다.
  await transporter.sendMail({
    from: '"요건 다 내꺼" <webfrontyogeun2@gmail.com>', // sender address
    to: process.env.MY_EMAIL, // list of receivers
    subject: "요건 다 내꺼 식품영양성분 DB 업데이트 필요 ", // Subject line

    html: `<h1>식품 영양 성분 업데이트가 필요합니다!</h1>`,
  });
}
