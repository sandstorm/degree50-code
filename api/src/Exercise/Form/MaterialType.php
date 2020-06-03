<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\Material;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Routing\RouterInterface;
use Vich\UploaderBundle\Form\Type\VichFileType;

class MaterialType extends AbstractType
{

    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }


    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $router = $this->router;

        $builder
            ->add('name')
            ->add('file', VichFileType::class, [
                'download_uri' => static function (Material $material) use ($router) {
                    return $router->generate('app_material-download', ['id' => $material->getId()]);
                },
                'label' => false,
                'required' => false,
                'allow_delete' => true,
                'asset_helper' => true,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => Material::class
        ));
    }
}