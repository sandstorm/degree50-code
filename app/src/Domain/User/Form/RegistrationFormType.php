<?php

namespace App\Domain\User\Form;

use App\Domain\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Contracts\Translation\TranslatorInterface;

class RegistrationFormType extends AbstractType
{
    public function __construct(
        private readonly TranslatorInterface $translator
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', null, [
                'translation_domain' => 'user-registration',
                'label' => 'form.label.email',
                'attr' => ['autocomplete' => 'username'],
                'required' => true,
                'constraints' => [
                    new NotBlank([
                        'message' => $this->translator->trans('form.validation.email-blank', [], 'user-registration'),
                    ]),
                    new Email([
                        'message' => $this->translator->trans('form.validation.email-invalid', [], 'user-registration'),
                    ]),
                ],
            ])
            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'translation_domain' => 'user-registration',
                // TODO: somehow the default way to translate is not working with validation messages.
                'invalid_message' => $this->translator
                    ->trans('form.validation.password-mismatch', [], 'user-registration'),
                'first_options' => [
                    'label' => 'form.label.password',
                    'attr' => ['autocomplete' => 'new-password'],
                ],
                'second_options' => [
                    'label' => 'form.label.password-confirmation',
                    'attr' => ['autocomplete' => 'new-password'],
                ],
                'required' => true,
                // instead of being set onto the object directly,
                // this is read and encoded in the controller
                'mapped' => false,

                'constraints' => [
                    new NotBlank([
                        'message' => $this->translator->trans('form.validation.password-blank', [], 'user-registration')
                    ]),
                    new Length([
                        'min' => User::MIN_PASSWORD_LENGTH,
                        'minMessage' => $this->translator->trans('form.validation.password-too-short', ['{{ limit }}'], 'user-registration'),
                        // max length allowed by Symfony for security reasons
                        'max' => 4096,
                    ]),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
