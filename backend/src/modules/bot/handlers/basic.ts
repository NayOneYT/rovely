import { Composer, Keyboard } from "grammy"
import { telegramLinkService } from "../service.js"

export const basicComposer = new Composer()

basicComposer.command("start", async (ctx) => {
  const isPhoneLinked = await telegramLinkService.check(ctx.from!.id)
  if (!isPhoneLinked) {
    const keyboard = new Keyboard()
    keyboard.requestContact("📱Отправить номер телефона").resized()
    ctx.reply(
      "Для продолжения отправьте свой номер телефона нажав на кнопку ниже:",
      { reply_markup: keyboard }
    )
  } else {
    ctx.reply("Ваш номер телефона уже привязан к этому чату.")
  }
})

basicComposer.on("message:contact", async (ctx) => {
  const isPhoneLinked = await telegramLinkService.check(ctx.from.id)
  if (!isPhoneLinked) {
    if (ctx.from.id === ctx.message.contact.user_id) {
      const phone = ctx.message.contact.phone_number.startsWith("+")
        ? ctx.message.contact.phone_number
        : `+${ctx.message.contact.phone_number}`
      await telegramLinkService.save(phone, ctx.from.id)
      ctx.reply(
        `Теперь номер телефона ${phone} привязан к этому чату.`,
        { reply_markup: { remove_keyboard: true } }
      )
    } else {
      const number = Math.random()
      if (number >= 0 && number < 0.5) ctx.replyWithPhoto("https://forum-cdn.exbo.ru/2026-05-15/1778845305-699392-dooo-bratan.jpg")
      else ctx.replyWithPhoto("https://i.pinimg.com/236x/b4/89/34/b4893442e7bee529266712127844c5b9.jpg")
    }
  }
})